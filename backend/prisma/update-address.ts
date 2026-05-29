import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const userId = 'cmp4ewupd000huw14gkh85lo3'
    
    console.log(`Updating address for user ${userId}...`)
    
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            profile: {
                update: {
                    address: 'Final Plot-52, CTS No-446, Manik Nagar, New Mangalwar Peth, Lane No-1C, Station Rd',
                    city: 'Pune',
                    state: 'Maharashtra',
                    pincode: '411011',
                }
            }
        },
        include: { profile: true }
    })
    
    console.log('✅ Address updated successfully!')
    console.log('Address:', user.profile?.address)
    console.log('City:', user.profile?.city)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
