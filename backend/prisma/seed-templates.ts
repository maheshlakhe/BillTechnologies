import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const templates = [
    {
      name: 'Modern Blue',
      pageSize: 'A4',
      industry: 'classic',
      columnConfig: JSON.stringify([
        { key: 'product_name', label: 'Item Description', type: 'text', dbField: 'productName' },
        { key: 'hsn', label: 'HSN/SAC', type: 'text', dbField: 'product.hsn' },
        { key: 'quantity', label: 'Qty', type: 'number', dbField: 'quantity' },
        { key: 'price', label: 'Rate', type: 'number', dbField: 'price' },
        { key: 'tax_rate', label: 'GST %', type: 'number', dbField: 'taxRate' },
        { key: 'total', label: 'Amount', type: 'number', dbField: 'total' }
      ]),
      isSystem: true
    },
    {
      name: 'Professional Red',
      pageSize: 'A4',
      industry: 'classic',
      columnConfig: JSON.stringify([
        { key: 'product_name', label: 'Product Name', type: 'text', dbField: 'productName' },
        { key: 'quantity', label: 'Quantity', type: 'number', dbField: 'quantity' },
        { key: 'price', label: 'Price', type: 'number', dbField: 'price' },
        { key: 'tax_amount', label: 'Tax', type: 'number', dbField: 'taxAmount' },
        { key: 'total', label: 'Total', type: 'number', dbField: 'total' }
      ]),
      isSystem: true
    },
    {
      name: 'Thermal Receipt',
      pageSize: '80mm',
      industry: 'food',
      columnConfig: JSON.stringify([
        { key: 'product_name', label: 'Item', type: 'text', dbField: 'productName' },
        { key: 'quantity', label: 'Qty', type: 'number', dbField: 'quantity' },
        { key: 'price', label: 'Rate', type: 'number', dbField: 'price' },
        { key: 'total', label: 'Total', type: 'number', dbField: 'total' }
      ]),
      isSystem: true
    }
  ];

  for (const t of templates) {
    await prisma.template.upsert({
      where: { id: t.name.toLowerCase().replace(/ /g, '-') },
      update: t,
      create: {
        id: t.name.toLowerCase().replace(/ /g, '-'),
        ...t
      }
    });
  }

  console.log('Templates seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
