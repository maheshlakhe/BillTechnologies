import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const userId = 'cmp4ewupd000huw14gkh85lo3'
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true, branding: true }
    })
    console.log('User found:', !!user)
    if (user) {
        console.log('Profile exists:', !!user.profile)
        console.log('Branding exists:', !!user.branding)
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
