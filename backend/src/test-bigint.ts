import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const products = await prisma.product.findMany({
      take: 1
    });
    console.log('Product found:', products[0]);
    console.log('JSON conversion test:', JSON.stringify(products[0]));
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
