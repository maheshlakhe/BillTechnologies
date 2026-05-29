import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        where: { email: { contains: 'retail' } },
        include: { industry: true }
    })
    console.log('--- ALL RETAIL-RELATED USERS ---')
    users.forEach(u => {
        console.log(`- Email: ${u.email}, Industry ID: ${u.industryId}, Industry Name: ${u.industry?.name}, Industry Slug: ${u.industry?.slug}`)
    })
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
