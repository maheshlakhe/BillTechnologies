import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding 4 sub-users for all 21 industries...');

  const password = 'Shubham@143';
  const hashedPassword = await bcrypt.hash(password, 10);

  const industries = [
    'retail', 'pharmacy', 'automobile', 'electronics', 'healthcare',
    'education', 'real-estate', 'logistics', 'manufacturing', 'hospitality',
    'textile', 'fmcg', 'jewellery', 'services', 'grocery',
    'gym', 'salon', 'restaurant', 'hardware', 'furniture', 'mobile-shop'
  ];

  // 1. Ensure the standard roles exist in the database
  const roleNames = ['MANAGER', 'ACCOUNTANT', 'OPERATOR', 'TECHNICIAN', 'ADMIN', 'VIEWER', 'READONLY'];
  const dbRoles: Record<string, string> = {};

  for (const name of roleNames) {
    const roleObj = await prisma.role.upsert({
      where: { name: name as any },
      update: {},
      create: {
        name: name as any,
        displayName: name.charAt(0) + name.slice(1).toLowerCase(),
        isActive: true
      }
    });
    dbRoles[name] = roleObj.id;
  }
  console.log('✅ Standard roles mapped and verified.');

  // 2. Define industry-specific sub-user profile configurations
  const getIndustrySubUsers = (slug: string) => {
    switch (slug) {
      case 'healthcare':
        return [
          { role: 'MANAGER', name: 'Dr. Sarah Jenkins (Head Nurse)', phone: '9876543210', emailSuffix: 'manager' },
          { role: 'ACCOUNTANT', name: 'Alex Rivera (Medical Billing Specialist)', phone: '9876543211', emailSuffix: 'billing' },
          { role: 'OPERATOR', name: 'Elena Rostova (Admissions Scribe)', phone: '9876543212', emailSuffix: 'scribe' },
          { role: 'TECHNICIAN', name: 'Dr. Rajesh Kumar (Lab Pathologist)', phone: '9876543213', emailSuffix: 'technician', isEmployee: 1 }
        ];
      case 'education':
        return [
          { role: 'MANAGER', name: 'Prof. Albus Vance (Dean of Students)', phone: '9876543220', emailSuffix: 'dean' },
          { role: 'ACCOUNTANT', name: 'Prof. Minerva McGonagall (Bursar)', phone: '9876543221', emailSuffix: 'bursar' },
          { role: 'OPERATOR', name: 'Severus Snape (Registrar Clerk)', phone: '9876543222', emailSuffix: 'registrar' },
          { role: 'TECHNICIAN', name: 'Rubeus Hagrid (Lead Instructor)', phone: '9876543223', emailSuffix: 'instructor', isEmployee: 1 }
        ];
      case 'real-estate':
        return [
          { role: 'MANAGER', name: 'David Vance (Senior Agency Head)', phone: '9876543230', emailSuffix: 'broker' },
          { role: 'ACCOUNTANT', name: 'Linda Thorne (Escrow Specialist)', phone: '9876543231', emailSuffix: 'escrow' },
          { role: 'OPERATOR', name: 'Kevin Vance (Leasing Officer)', phone: '9876543232', emailSuffix: 'leasing' },
          { role: 'TECHNICIAN', name: 'Marcus Brody (Maintenance Engineer)', phone: '9876543233', emailSuffix: 'maintenance', isEmployee: 1 }
        ];
      case 'logistics':
        return [
          { role: 'MANAGER', name: 'Roger Sterling (Chief Dispatcher)', phone: '9876543240', emailSuffix: 'dispatcher' },
          { role: 'ACCOUNTANT', name: 'Fiona Gallagher (Freight Auditor)', phone: '9876543241', emailSuffix: 'billing' },
          { role: 'OPERATOR', name: 'Gavin Harris (Fleet Route Operator)', phone: '9876543242', emailSuffix: 'router' },
          { role: 'TECHNICIAN', name: 'Sam Kowalski (Head Fleet Mechanic)', phone: '9876543243', emailSuffix: 'mechanic', isEmployee: 1 }
        ];
      default:
        // Generic defaults for other 17 industries
        const prettyName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
        return [
          { role: 'MANAGER', name: `Alice Cooper (${prettyName} Manager)`, phone: '9876543250', emailSuffix: 'manager' },
          { role: 'ACCOUNTANT', name: `Bob Dylan (${prettyName} Accountant)`, phone: '9876543251', emailSuffix: 'accountant' },
          { role: 'OPERATOR', name: `Charlie Watts (${prettyName} Cashier)`, phone: '9876543252', emailSuffix: 'cashier' },
          { role: 'TECHNICIAN', name: `Douglas Adams (${prettyName} Technician)`, phone: '9876543253', emailSuffix: 'technician', isEmployee: 1 }
        ];
    }
  };

  // 3. Loop through industries and create sub-users
  for (const slug of industries) {
    const parentEmail = `support_${slug.replace(/-/g, '_')}@agbtechnologies.com`;

    // Find parent user
    const parent = await prisma.user.findUnique({
      where: { email: parentEmail },
      include: { profile: true }
    });

    if (!parent) {
      console.warn(`⚠️ Parent admin ${parentEmail} not found! Skipping sub-user seeding for ${slug}.`);
      continue;
    }

    console.log(`👤 Seeding 4 team members for parent admin: ${parentEmail} (${slug})`);

    const subUsersData = getIndustrySubUsers(slug);

    for (const sub of subUsersData) {
      const subEmail = `${slug.replace(/-/g, '_')}_${sub.emailSuffix}@agbtechnologies.com`;
      const roleId = dbRoles[sub.role];

      if (!roleId) {
        console.error(`❌ Role ${sub.role} not mapped!`);
        continue;
      }

      // Default permissions based on role
      let permissions = ['view_bills', 'view_products'];
      if (sub.role === 'MANAGER') {
        permissions = ['view_bills', 'create_bills', 'edit_bills', 'delete_bills', 'bills:export', 'view_products', 'manage_products', 'view_customers', 'manage_customers', 'view_reports', 'manage_expenses', 'manage_users'];
      } else if (sub.role === 'ACCOUNTANT') {
        permissions = ['view_bills', 'create_bills', 'view_reports', 'tax_gst_reports', 'manage_expenses', 'view_customers'];
      } else if (sub.role === 'OPERATOR') {
        permissions = ['view_products', 'manage_products', 'view_bills', 'create_bills'];
      } else if (sub.role === 'TECHNICIAN') {
        permissions = ['manage_services', 'view_bills'];
      }

      // Upsert the sub-user
      const existingUser = await prisma.user.findUnique({
        where: { email: subEmail }
      });

      let subUser;
      if (existingUser) {
        subUser = await prisma.user.update({
          where: { email: subEmail },
          data: {
            password: hashedPassword,
            roleId: roleId,
            parentId: parent.id,
            isVerified: true,
            isActive: true,
            isEmployee: sub.isEmployee ? 1 : 0,
            industryId: parent.industryId,
            profile: {
              upsert: {
                create: {
                  name: sub.name,
                  phone: sub.phone,
                  companyName: parent.profile?.companyName || ''
                },
                update: {
                  name: sub.name,
                  phone: sub.phone
                }
              }
            },
            security: {
              upsert: {
                create: {
                  permissions: JSON.stringify(permissions),
                  passwordSet: true
                },
                update: {
                  permissions: JSON.stringify(permissions)
                }
              }
            }
          }
        });
      } else {
        subUser = await prisma.user.create({
          data: {
            email: subEmail,
            password: hashedPassword,
            roleId: roleId,
            parentId: parent.id,
            isVerified: true,
            isActive: true,
            isEmployee: sub.isEmployee ? 1 : 0,
            industryId: parent.industryId,
            profile: {
              create: {
                name: sub.name,
                phone: sub.phone,
                companyName: parent.profile?.companyName || ''
              }
            },
            security: {
              create: {
                permissions: JSON.stringify(permissions),
                passwordSet: true
              }
            }
          }
        });
      }

      console.log(`   ✅ Seeded sub-user: ${subEmail} as ${sub.role} (${sub.name})`);
    }
  }

  console.log('🎉 Seeding sub-users successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding sub-users failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
