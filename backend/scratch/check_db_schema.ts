import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
    console.log('--- Table Info ---');
    const info = await p.$queryRawUnsafe(`PRAGMA table_info(settings)`);
    console.log(info);
    console.log('--- Index List ---');
    const indices = await p.$queryRawUnsafe(`PRAGMA index_list(settings)`);
    console.log(indices);
    for (const idx of (indices as any)) {
        console.log(`--- Index Info (${idx.name}) ---`);
        const idxInfo = await p.$queryRawUnsafe(`PRAGMA index_info(${idx.name})`);
        console.log(idxInfo);
    }
}
main().finally(() => p.$disconnect());
