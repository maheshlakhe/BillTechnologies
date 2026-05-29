import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const userId = 'cmp4ewupd000huw14gkh85lo3'
    
    console.log(`Setting up profile for user ${userId}...`)
    
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            profile: {
                upsert: {
                    create: {
                        name: 'Shubham Pardhi',
                        phone: '9049874780',
                        companyName: 'AGB Technologies',
                    },
                    update: {
                        name: 'Shubham Pardhi',
                        phone: '9049874780',
                        companyName: 'AGB Technologies',
                    }
                }
            },
            branding: {
                upsert: {
                    create: {
                        logoUrl: '',
                        primaryColor: '#3b82f6',
                    },
                    update: {
                        primaryColor: '#3b82f6',
                    }
                }
            }
        },
        include: { profile: true, branding: true }
    })
    
    console.log('✅ User updated successfully!')
    console.log('Profile:', user.profile)
    console.log('Branding:', user.branding)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
