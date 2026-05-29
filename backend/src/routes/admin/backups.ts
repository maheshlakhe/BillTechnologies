import express, { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { authenticateToken, requirePermission } from '../../middleware/auth';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const router = express.Router();


/**
 * POST /api/admin/backups/log
 * Endpoint for external rclone scripts to report their status.
 * Supports either JWT Authentication or a permanent BACKUP_API_KEY.
 */
router.post('/log', async (req: Request, res: Response) => {
    const backupKey = process.env.BACKUP_API_KEY;
    const providedKey = req.headers['x-backup-key'];

    const processLog = async () => {
        try {
            const { filename, location, status, size, errorMessage } = req.body;
            
            const log = await prisma.backupLog.create({
                data: {
                    filename: filename || 'unknown',
                    location: location || 'External',
                    status: status || 'SUCCESS',
                    size: size ? parseInt(String(size), 10) : null,
                    errorMessage: errorMessage || null,
                    completedAt: new Date()
                }
            });
            
            return res.json({ success: true, data: log });
        } catch (error: any) {
            console.error('[BackupLog POST] Error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    };

    // If a valid API key is provided, bypass standard auth
    if (backupKey && providedKey === backupKey) {
        return processLog();
    }

    // Otherwise, require standard SuperAdmin authentication
    return authenticateToken(req, res, () => {
        return requirePermission('manage_settings')(req, res, () => {
            return processLog();
        });
    });
});

// Middleware: Subsequent routes (GET / and POST /trigger) require 'manage_settings'
router.use(authenticateToken);
router.use(requirePermission('manage_settings'));

/**
 * GET /api/admin/backups
 * Fetches the recent backup history logs
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const logs = await prisma.backupLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json({ success: true, data: logs });
  } catch (error: any) {
    console.error('[BackupLogs GET] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


/**
 * POST /api/admin/backups/trigger
 * Triggers a manual database backup (Local copy + Rclone sync)
 */
router.post('/trigger', async (req: Request, res: Response) => {
  const startedAt = new Date();
  let logId = '';

  try {
    // 1. Create initial log entry in database
    const initialLog = await prisma.backupLog.create({
      data: {
        filename: `manual-backup-${startedAt.getTime()}.db`,
        location: 'Local + Rclone',
        status: 'RUNNING',
      }
    });
    logId = initialLog.id;

    // 2. Locate the SQLite database file
    const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
    let dbPath = dbUrl.replace('file:', '');
    
    if (!path.isAbsolute(dbPath)) {
        // Resolve relative to the prisma directory
        dbPath = path.join(process.cwd(), 'prisma', dbPath);
    }
    
    if (!fs.existsSync(dbPath)) {
        throw new Error(`Database file not found at ${dbPath}`);
    }

    // 3. Create the backup directory if it doesn't exist
    const backupDir = path.join(path.dirname(dbPath), 'backups');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = startedAt.toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${timestamp}.db`;
    const backupPath = path.join(backupDir, backupFileName);

    // 4. Perform the local copy
    fs.copyFileSync(dbPath, backupPath);
    const stats = fs.statSync(backupPath);

    // 5. Trigger Rclone (runs in background)
    // We assume the user has configured rclone on the server.
    // We use an environment variable for the remote name, defaulting to 'drive:backups'
    const rcloneRemote = process.env.RCLONE_REMOTE || 'drive:backups';
    
    console.log(`[Backup] Starting rclone sync to ${rcloneRemote}...`);
    
    exec(`rclone copy "${backupPath}" "${rcloneRemote}"`, async (error, stdout, stderr) => {
      const status = error ? 'FAILED' : 'SUCCESS';
      const errMsg = error ? (stderr || error.message) : null;
      const location = error ? 'Local Only (Rclone Failed)' : `Local & ${rcloneRemote}`;

      try {
        await prisma.backupLog.update({
          where: { id: logId },
          data: {
            filename: backupFileName,
            status: status as any,
            size: stats.size,
            errorMessage: errMsg,
            completedAt: new Date(),
            location: location
          }
        });
        console.log(`[Backup] Completed. Status: ${status}`);
      } catch (logErr) {
        console.error('[Backup] Failed to update final log status:', logErr);
      }
    });

    res.json({ 
        success: true, 
        message: 'Backup triggered successfully. Cloud sync is running in the background.',
        logId 
    });

  } catch (error: any) {
    console.error('[BackupTrigger] CRITICAL ERROR:', error);
    if (logId) {
      await prisma.backupLog.update({
        where: { id: logId },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
          completedAt: new Date()
        }
      }).catch(() => {});
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
