import { execSync } from 'child_process';
import path from 'path';

const seeds = [
  'seed-industries.ts',
  'seed-new-tables.ts',
  'seed-demo-user.ts',
  'seed-industry-views.ts',
  'seed-product-view-forms.ts',
  'seed-products.ts',
  'seed-templates.ts',
  'seed-security.ts',
  'seed.ts',
  'seed-more-data.ts',
  'seed-sub-users.ts'
];

async function main() {
  console.log('🚀 === STARTING CONSOLIDATED MULTI-INDUSTRY DATABASE SEEDING ===');
  const start = Date.now();

  for (let i = 0; i < seeds.length; i++) {
    const seed = seeds[i];
    const filePath = path.join(__dirname, seed);
    console.log(`\n============================================================`);
    console.log(`🏃 [${i + 1}/${seeds.length}] Running: ${seed}`);
    console.log(`============================================================`);
    try {
      execSync(`npx tsx "${filePath}"`, { stdio: 'inherit' });
      console.log(`✅ Completed: ${seed}`);
    } catch (error: any) {
      console.error(`❌ Failed: ${seed}`);
      console.error(error.message);
      process.exit(1);
    }
  }

  const duration = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`\n🎉 === ALL SEED SCRIPTS EXECUTED SUCCESSFULLY IN ${duration}s ===`);
}

main().catch(err => {
  console.error('Fatal Seeding Error:', err);
  process.exit(1);
});
