import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

interface IndustryConfig {
    companyName: string;
    ownerName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    logoUrl: string;
    primaryColor: string;
    defaultBillSize: string;
    activeTemplateId: string;
}

const industryConfigs: Record<string, IndustryConfig> = {
    restaurant: {
        companyName: 'Gourmet Bistro & Cafe',
        ownerName: 'Chef Ranveer Brar',
        phone: '9811122233',
        address: 'Shop 4, Ground Floor, Koregaon Park Plaza, Lane 7',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=60',
        primaryColor: '#e11d48', // Premium Rose Red
        defaultBillSize: '80mm', // Thermal receipt!
        activeTemplateId: 'thermal-receipt'
    },
    pharmacy: {
        companyName: 'MedLife Wellness Pharmacy',
        ownerName: 'Dr. Aditi Sharma',
        phone: '9822233344',
        address: 'G-15, Royal Heritage Mall, NIBM Road, Kondhwa',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411048',
        logoUrl: 'https://images.unsplash.com/photo-1607619056574-7b8d304f3c6f?w=200&auto=format&fit=crop&q=60',
        primaryColor: '#0d9488', // Teal
        defaultBillSize: 'A5', // A5 medical slip
        activeTemplateId: 'modern-blue'
    },
    retail: {
        companyName: 'Urban Trendz Fashion Store',
        ownerName: 'Rohan Malhotra',
        phone: '9833344455',
        address: 'F-42, Phoenix Marketcity, Viman Nagar',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411014',
        logoUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&auto=format&fit=crop&q=60',
        primaryColor: '#7c3aed', // Purple
        defaultBillSize: 'A4', // Standard boutique invoice
        activeTemplateId: 'professional-red'
    },
    automobile: {
        companyName: 'Speedway Motors & Spares',
        ownerName: 'Amit Gadre',
        phone: '9844455566',
        address: 'Plot 104, Chinchwad MIDC Industrial Block',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411019',
        logoUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=200&auto=format&fit=crop&q=60',
        primaryColor: '#f97316', // Orange
        defaultBillSize: 'A4',
        activeTemplateId: 'modern-blue'
    },
    electronics: {
        companyName: 'Galaxy Electronics Hub',
        ownerName: 'Suhas Joshi',
        phone: '9855566677',
        address: 'Shop 12, Deccan Gymkhana Main Road',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411004',
        logoUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=60',
        primaryColor: '#2563eb', // Blue
        defaultBillSize: 'A4',
        activeTemplateId: 'modern-blue'
    },
    healthcare: {
        companyName: 'City Care Medical Clinic',
        ownerName: 'Dr. Nilesh Shah',
        phone: '9866677788',
        address: 'Flat 102, Kothrud Commercial Complex',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411038',
        logoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200&auto=format&fit=crop&q=60',
        primaryColor: '#0ea5e9', // Sky Blue
        defaultBillSize: 'A5',
        activeTemplateId: 'modern-blue'
    },
    education: {
        companyName: 'Zenith Coaching Academy',
        ownerName: 'Prof. M. N. Apte',
        phone: '9877788899',
        address: 'Building 4B, Sadashiv Peth near Jnana Prabodhini',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411030',
        logoUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=200&auto=format&fit=crop&q=60',
        primaryColor: '#0284c7', // Sky-Dark
        defaultBillSize: 'A4',
        activeTemplateId: 'professional-red'
    },
    'real-estate': {
        companyName: 'Vanguard Realty Developers',
        ownerName: 'Vijay Oswal',
        phone: '9888899900',
        address: 'Penthouse 2, Trump Towers, Kalyani Nagar',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411006',
        logoUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&auto=format&fit=crop&q=60',
        primaryColor: '#0f172a', // Slate
        defaultBillSize: 'A4',
        activeTemplateId: 'modern-blue'
    },
    logistics: {
        companyName: 'Express Cargo & Logistics',
        ownerName: 'Jaspreet Singh',
        phone: '9899900011',
        address: 'Warehouse A1, Wagholi Freight Hub',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '412207',
        logoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&auto=format&fit=crop&q=60',
        primaryColor: '#ca8a04', // Yellow
        defaultBillSize: 'A4',
        activeTemplateId: 'modern-blue'
    },
    manufacturing: {
        companyName: 'Standard Industrial Parts',
        ownerName: 'Ramesh Kirloskar',
        phone: '9800011122',
        address: 'Sector 7, Bhosari MIDC Industrial Estate',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411026',
        logoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&auto=format&fit=crop&q=60',
        primaryColor: '#4b5563', // Gray
        defaultBillSize: 'A4',
        activeTemplateId: 'modern-blue'
    },
    hospitality: {
        companyName: 'Royal Heritage Hotel',
        ownerName: 'Vikramaditya Scindia',
        phone: '9811100022',
        address: 'Plot 40, Mahabaleshwar Bypass Highway',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '412806',
        logoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=60',
        primaryColor: '#b45309', // Amber
        defaultBillSize: 'A4',
        activeTemplateId: 'professional-red'
    },
    textile: {
        companyName: 'Vardhman Textiles & Garments',
        ownerName: 'Manish Malhotra',
        phone: '9822200033',
        address: 'Shop 55, Laxmi Road Fabric Market',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411030',
        logoUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=200&auto=format&fit=crop&q=60',
        primaryColor: '#db2777', // Pink
        defaultBillSize: 'A4',
        activeTemplateId: 'professional-red'
    },
    fmcg: {
        companyName: 'Hindustan Consumer Goods',
        ownerName: 'Sanjay Singhal',
        phone: '9833300044',
        address: 'Plot 92, Hadapsar Industrial Estate',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411013',
        logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=60',
        primaryColor: '#16a34a', // Green
        defaultBillSize: 'A4',
        activeTemplateId: 'modern-blue'
    },
    jewellery: {
        companyName: 'Tanishq Gold & Diamonds',
        ownerName: 'Purshottam Saraf',
        phone: '9844400055',
        address: 'Showroom 3, Bund Garden Road, Camp',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        logoUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&auto=format&fit=crop&q=60',
        primaryColor: '#854d0e', // Gold-Brown
        defaultBillSize: 'A5',
        activeTemplateId: 'professional-red'
    },
    services: {
        companyName: 'Elite Home Services',
        ownerName: 'Nikhil Kadam',
        phone: '9855500066',
        address: 'Office 402, Balewadi High Street',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411045',
        logoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&auto=format&fit=crop&q=60',
        primaryColor: '#06b6d4', // Cyan
        defaultBillSize: 'A4',
        activeTemplateId: 'modern-blue'
    },
    grocery: {
        companyName: 'SuperMart Grocery Bazaar',
        ownerName: 'Dhanpal Shah',
        phone: '9866600077',
        address: 'Building A, Katraj Chowk Main Road',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411046',
        logoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&auto=format&fit=crop&q=60',
        primaryColor: '#22c55e', // Green
        defaultBillSize: '80mm', // Thermal receipt
        activeTemplateId: 'thermal-receipt'
    },
    gym: {
        companyName: 'Iron Temple Fitness Gym',
        ownerName: 'Sangram Chougule',
        phone: '9877700088',
        address: 'Third Floor, IT Park, Aundh Ravet Rd',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411007',
        logoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&auto=format&fit=crop&q=60',
        primaryColor: '#dc2626', // Red
        defaultBillSize: 'A5',
        activeTemplateId: 'modern-blue'
    },
    salon: {
        companyName: 'Enrich Beauty Salon & Spa',
        ownerName: 'Jawed Habib',
        phone: '9888800099',
        address: 'Shop 19, Kharadi IT Park Road',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411014',
        logoUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&auto=format&fit=crop&q=60',
        primaryColor: '#ec4899', // Pink
        defaultBillSize: '80mm', // Thermal
        activeTemplateId: 'thermal-receipt'
    },
    hardware: {
        companyName: 'National Hardware & Tools',
        ownerName: 'Gopal Patel',
        phone: '9899900000',
        address: 'Chowk 42, Budhwar Peth Wholesale Market',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411002',
        logoUrl: 'https://images.unsplash.com/photo-1530124560072-a059b014b668?w=200&auto=format&fit=crop&q=60',
        primaryColor: '#6b7280', // Gray
        defaultBillSize: 'A5',
        activeTemplateId: 'modern-blue'
    },
    furniture: {
        companyName: 'Woodcraft Classic Furniture',
        ownerName: 'Sunderlal Vishwakarma',
        phone: '9800000011',
        address: 'Showroom 10, Pune-Mumbai Highway, Pimpri',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411018',
        logoUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=200&auto=format&fit=crop&q=60',
        primaryColor: '#b45309', // Brown
        defaultBillSize: 'A4',
        activeTemplateId: 'professional-red'
    },
    'mobile-shop': {
        companyName: 'Cellular World Mobile Store',
        ownerName: 'Ketan Mehta',
        phone: '9811111100',
        address: 'Shop 8, FC Road opposite Fergusson College',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411004',
        logoUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=60',
        primaryColor: '#3b82f6', // Blue
        defaultBillSize: '80mm', // Thermal
        activeTemplateId: 'thermal-receipt'
    }
}

async function main() {
    console.log('🌱 Seeding 21 industry demo users with premium configurations...')

    const password = 'Shubham@143'
    const hashedPassword = await bcrypt.hash(password, 10)

    // Base shared admin profile
    const sharedProfile = {
        name: 'Shubham Pardhi',
        phone: '9049874780',
        companyName: 'AGB Technologies',
        address: 'Final Plot-52, CTS No-446, Manik Nagar, New Mangalwar Peth, Lane No-1C, Station Rd',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411011'
    }

    const industries = [
        'retail', 'pharmacy', 'automobile', 'electronics', 'healthcare', 
        'education', 'real-estate', 'logistics', 'manufacturing', 'hospitality', 
        'textile', 'fmcg', 'jewellery', 'services', 'grocery', 
        'gym', 'salon', 'restaurant', 'hardware', 'furniture', 'mobile-shop'
    ]

    // Ensure ADMIN role exists
    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' as any },
        update: {},
        create: {
            name: 'ADMIN' as any,
            displayName: 'Administrator',
            isActive: true
        }
    })

    // 1. Create Main Support Account
    await prisma.user.upsert({
        where: { email: 'support@agbtechnologies.com' },
        update: { 
            password: hashedPassword,
            roleId: adminRole.id,
            isVerified: true,
            profile: {
                upsert: {
                    create: sharedProfile,
                    update: sharedProfile
                }
            },
            branding: {
                upsert: {
                    create: { logoUrl: '', primaryColor: '#3b82f6' },
                    update: { primaryColor: '#3b82f6' }
                }
            }
        },
        create: {
            email: 'support@agbtechnologies.com',
            password: hashedPassword,
            isVerified: true,
            isActive: true,
            roleId: adminRole.id,
            profile: { create: sharedProfile },
            branding: { create: { logoUrl: '', primaryColor: '#3b82f6' } }
        }
    })

    // 2. Create Industry Specific Accounts
    for (const slug of industries) {
        const email = `support_${slug.replace(/-/g, '_')}@agbtechnologies.com`
        
        // Find industry
        const ind = await prisma.industryMaster.findUnique({ where: { slug } })
        const industryId = ind ? ind.id : null

        // Get specialized branding/profile details or use base fallback
        const cfg = industryConfigs[slug];
        
        const uProfile = {
            name: cfg ? cfg.ownerName : 'Shubham Pardhi',
            phone: cfg ? cfg.phone : '9049874780',
            companyName: cfg ? cfg.companyName : `AGB ${slug.toUpperCase()} Co`,
            address: cfg ? cfg.address : 'Lane 2C, Station Road',
            city: cfg ? cfg.city : 'Pune',
            state: cfg ? cfg.state : 'Maharashtra',
            pincode: cfg ? cfg.pincode : '411011'
        }

        const uBranding = {
            logoUrl: cfg ? cfg.logoUrl : '',
            primaryColor: cfg ? cfg.primaryColor : '#3b82f6',
            defaultBillSize: cfg ? cfg.defaultBillSize : 'A4',
            activeTemplateId: cfg ? cfg.activeTemplateId : 'default',
            billIndustry: slug
        }

        await prisma.user.upsert({
            where: { email },
            update: { 
                password: hashedPassword,
                roleId: adminRole.id,
                isVerified: true,
                industryId: industryId,
                profile: {
                    upsert: {
                        create: uProfile,
                        update: uProfile
                    }
                },
                branding: {
                    upsert: {
                        create: uBranding,
                        update: uBranding
                    }
                }
            },
            create: {
                email,
                password: hashedPassword,
                isVerified: true,
                isActive: true,
                roleId: adminRole.id,
                industryId: industryId,
                profile: { create: uProfile },
                branding: { create: uBranding }
            }
        })
        console.log(`✅ Demo user ${email} [${slug}] customized with premium profile & branding!`)
    }
    console.log('🎉 Seeding demo users completed successfully!')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
