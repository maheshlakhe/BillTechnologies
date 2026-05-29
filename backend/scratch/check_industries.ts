import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Fetching all industries from IndustryMaster...');
    const industries = await prisma.industryMaster.findMany();
    console.log(`Found ${industries.length} industries:`);
    for (const ind of industries) {
        console.log(`- Slug: ${ind.slug}, ID: ${ind.id}, Name: ${ind.name}`);
    }

    console.log('\nChecking user: support_healthcare@agbtechnologies.com...');
    const user = await prisma.user.findUnique({
        where: { email: 'support_healthcare@agbtechnologies.com' },
        include: { industry: true }
    });
    if (user) {
        console.log(`User IndustryId: ${user.industryId}`);
        console.log(`User Industry Object:`, user.industry);
    } else {
        console.log('User not found!');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
