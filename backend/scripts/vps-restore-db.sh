#!/bin/bash

# =============================================================================
# BillSoft Production Database Restoration Script
# =============================================================================
# This script restores the production application database from a backup file.
# It ensures that the Docker volume is updated correctly while maintaining service health.

# --- Configuration ---
DEPLOY_DIR="/home/agbdevops/billsoft/billsoft_saas"
DB_BACKUP_SOURCE="$DEPLOY_DIR/backend/backups/final-safe.db"
DB_TARGET_NAME="billsoft.db" # Name inside the container/volume
BACKEND_CONTAINER="billsoft-backend"
VOLUME_NAME="billsoft_saas_sqlite_data" # Default name usually project_volume

# --- Helper: Log ---
log() {
    echo -e "\033[1;34m[RESTORE]\033[0m $1"
}

# --- Initialization ---
log "Starting Database Restoration Process..."

if [ ! -f "$DB_BACKUP_SOURCE" ]; then
    echo "❌ Error: Backup source not found at $DB_BACKUP_SOURCE"
    exit 1
fi

log "Source found: $DB_BACKUP_SOURCE"

# 1. Temporarily stop the backend to release DB locks
log "Stopping $BACKEND_CONTAINER..."
docker stop $BACKEND_CONTAINER

# 2. Backup the CURRENT live DB before overwriting (Safety First!)
log "Creating safety backup of existing live data..."
DATE_TAG=$(date +"%Y%m%d_%H%M%S")
# We copy from the container's volume. Since container is stopped, we use a temporary helper container to access the volume.
docker run --rm -v ${VOLUME_NAME}:/data -v "$DEPLOY_DIR/backend/backups":/backup alpine \
    cp /data/$DB_TARGET_NAME /backup/pre_restore_backup_$DATE_TAG.db || log "No existing DB found to backup, proceeding."

# 3. Inject the New Data into the Volume
log "Injecting $DB_BACKUP_SOURCE into volume $VOLUME_NAME..."
docker run --rm -v ${VOLUME_NAME}:/data -v "$DEPLOY_DIR/backend/backups":/backup alpine \
    cp /backup/final-safe.db /data/$DB_TARGET_NAME

log "Data injection complete."

# 4. Restart the Service
log "Restarting $BACKEND_CONTAINER..."
docker start $BACKEND_CONTAINER

# 5. Run Migrations to ensure schema matches the new code
log "Running database migrations to align schema..."
docker exec $BACKEND_CONTAINER npx prisma migrate deploy

log "✅ Database successfully restored and migrated!"
log "Live data is now synchronized with final-safe.db."
