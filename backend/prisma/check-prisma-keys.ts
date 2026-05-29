import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('Prisma Client keys:');
const keys = Object.keys(prisma);
console.log(keys);

// Check specifically for model keys
const prismaKeys = Object.getOwnPropertyNames(prisma);
console.log('All Property Names on prisma instance:');
console.log(prismaKeys.filter(k => !k.startsWith('_')));

process.exit(0);
