import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Updating database templates defaults...')
    
    // 1. Update all business profiles
    const bpResult = await prisma.businessProfile.updateMany({
        data: {
            activeTemplateId: 'thermal_58mm',
            defaultBillSize: '58mm'
        }
    })
    console.log(`Updated ${bpResult.count} BusinessProfile records.`)

    // 2. Update all user brandings
    const ubResult = await prisma.userBranding.updateMany({
        data: {
            activeTemplateId: 'thermal_58mm',
            defaultBillSize: '58mm'
        }
    })
    console.log(`Updated ${ubResult.count} UserBranding records.`)

    // 3. Upsert PO_CONFIG active_template in settings
    const setting = await prisma.settings.upsert({
        where: {
            category_key: {
                category: 'PO_CONFIG',
                key: 'active_template'
            }
        },
        update: {
            value: '"po_professional_blue"'
        },
        create: {
            category: 'PO_CONFIG',
            key: 'active_template',
            value: '"po_professional_blue"',
            displayName: 'Active PO Template',
            valueType: 'STRING'
        }
    })
    console.log('Upserted PO_CONFIG active_template in settings.')

    // 4. Update all setting states for active_template under PO_CONFIG
    const stateResult = await prisma.settingState.updateMany({
        where: {
            settingId: setting.id
        },
        data: {
            value: '"po_professional_blue"'
        }
    })
    console.log(`Updated ${stateResult.count} SettingState records for PO active template.`)

    console.log('✅ Database templates update completed successfully!')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
