import { PrismaClient } from '@prisma/client';

// BigInt JSON support (global)
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

const prisma = new PrismaClient();

async function main() {
  try {
    const products = await prisma.product.findMany({
      take: 1
    });
    console.log('Product found:', products[0]);
    console.log('JSON conversion test:', JSON.stringify(products[0]));
    console.log('Success!');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
