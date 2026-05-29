
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.settings.findMany({
    orderBy: [
      { key: 'asc' },
      { category: 'asc' }
    ]
  });
  console.log('Settings in Database:');
  console.table(settings.map(s => ({
    id: s.id,
    key: s.key,
    category: s.category,
    value: s.value,
    valueType: s.valueType
  })));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
