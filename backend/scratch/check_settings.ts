import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.settings.findMany();
  console.log('Settings Rows:');
  settings.forEach(s => {
    console.log(`ID: ${s.id}, Category: ${s.category}, Key: ${s.key}, Value: ${s.value}`);
  });
  
  const settingStates = await prisma.settingState.findMany();
  console.log('\nSettingState Rows:');
  settingStates.forEach(ss => {
    console.log(`SettingId: ${ss.settingId}, UserId: ${ss.userId}, Value: ${ss.value}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
