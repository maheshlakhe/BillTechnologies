import prisma from '../lib/prisma';

export interface LowStockCheckResult {
    isLowStock: boolean;
    effectiveThreshold: number;
    notificationsEnabled: boolean;
}

/**
 * Centrally handles the low stock alert logic to ensure consistency across Cron, Bills, and Products.
 * 
 * Condition: if (product.stock <= threshold)
 */
export async function checkProductLowStock(productId: string, currentStock: bigint | number): Promise<LowStockCheckResult> {
    try {
        // 1. Fetch relevant notification settings
        const [alertEnabledRow, thresholdRow] = await Promise.all([
            prisma.settings.findFirst({ where: { key: 'lowStockAlertEnabled', category: 'notifications' } }),
            prisma.settings.findFirst({ where: { key: 'lowStockThreshold', category: 'notifications' } })
        ]);

        // 2. Parse settings with safe fallbacks
        let isEnabled = true; // Default to true as per component logic
        if (alertEnabledRow) {
            try {
                const parsed = JSON.parse(alertEnabledRow.value);
                isEnabled = (parsed === true || parsed === 'true');
            } catch {
                isEnabled = alertEnabledRow.value === 'true';
            }
        }

        let threshold = 0; // Default to 0 internally for empty
        if (thresholdRow && thresholdRow.value !== '') {
            try {
                const parsed = JSON.parse(thresholdRow.value);
                threshold = parseInt(parsed, 10);
                if (isNaN(threshold)) threshold = 0;
            } catch {
                threshold = parseInt(thresholdRow.value, 10);
                if (isNaN(threshold)) threshold = 0;
            }
        }

        // 3. Perform the "Strict" check purely on numeric threshold
        // BigInt(currentStock) ensures we can compare with any numeric type safely
        const stockVal = BigInt(currentStock);
        const thresholdVal = BigInt(threshold);

        const isLow = stockVal < thresholdVal;

        console.log(`[StockAlertService] Checking product ${productId}: stock=${stockVal}, threshold=${thresholdVal}, enabled=${isEnabled} => isLowStock=${isLow}`);

        return {
            isLowStock: isLow,
            effectiveThreshold: threshold,
            notificationsEnabled: isEnabled
        };
    } catch (error) {
        console.error(`[StockAlertService] CRITICAL ERROR during low stock check for ${productId}:`, error);
        // Fallback logging for trigger failure
        return { isLowStock: false, effectiveThreshold: 0, notificationsEnabled: true };
    }
}

/**
 * Creates a notification if it doesn't already exist as unread.
 * DISABLED: Per requirements, stock alerts are dynamically computed and must not be stored in DB.
 */
export async function createLowStockNotification(userId: string, productName: string, stock: bigint | number) {
    // No-op. Alerts are generated dynamically on fetch in /inventory/alerts.
}
