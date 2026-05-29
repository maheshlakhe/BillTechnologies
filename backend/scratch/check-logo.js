
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLogo() {
  try {
    const user = await prisma.user.findFirst({
      where: { logoUrl: { not: null } }
    });
    
    console.log('--- USER LOGO CHECK ---');
    if (user) {
      console.log(`User Found: ${user.email}`);
      console.log(`Logo URL in DB: "${user.logoUrl}"`);
    } else {
      console.log('No user with a custom logo found in the database.');
    }

    const settings = await prisma.settings.findFirst({
        where: { key: 'logo_url' }
    });

    console.log('--- SETTINGS LOGO CHECK ---');
    if (settings) {
        console.log(`Settings Logo Found: "${settings.value}"`);
    } else {
        console.log('No logo found in global settings.');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkLogo();
