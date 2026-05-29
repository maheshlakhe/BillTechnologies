import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const industryData = [
    {
        name: 'Electronics',
        slug: 'electronics',
        icon: 'Devices',
        dropdownGroups: [
            { name: 'Brand', slug: 'brand', options: ['Samsung', 'Apple', 'Sony', 'LG', 'Dell', 'HP', 'Lenovo'] },
            { name: 'Warranty Type', slug: 'warranty_type', options: ['No Warranty', '6 Months', '1 Year', '2 Years', '5 Years'] },
            { name: 'Power Type', slug: 'power_type', options: ['Battery', 'Electric', 'Solar', 'Hybrid'] },
            { name: 'Condition', slug: 'condition', options: ['New', 'Refurbished', 'Used'] }
        ]
    },
    {
        name: 'Retail',
        slug: 'retail',
        icon: 'Storefront',
        dropdownGroups: [
            { name: 'Size (Alphabetic)', slug: 'size_alphabetic', options: ['XS', 'Small', 'Medium', 'Large', 'XL', 'XXL', 'XXXL'] },
            { name: 'Size (Numeric)', slug: 'size_numeric', options: ['28', '30', '32', '34', '36', '38', '40', '42', '44'] },
            { name: 'Gender', slug: 'gender', options: ['Men', 'Women', 'Kids', 'Unisex'] },
            { name: 'Fabric', slug: 'fabric', options: ['Cotton', 'Silk', 'Denim', 'Polyester', 'Wool', 'Linen'] },
            { name: 'Fit Type', slug: 'fit_type', options: ['Slim Fit', 'Regular Fit', 'Oversized', 'Relaxed Fit'] }
        ]
    },
    {
        name: 'Grocery',
        slug: 'grocery',
        icon: 'LocalGroceryStore',
        dropdownGroups: [
            { name: 'Unit', slug: 'unit', options: ['Kg', 'Gram', 'Liter', 'ml', 'Packet', 'Box', 'Bottle'] },
            { name: 'Packaging', slug: 'packaging', options: ['Loose', 'Packed', 'Vacuum Packed'] },
            { name: 'Storage Type', slug: 'storage_type', options: ['Room Temperature', 'Refrigerated', 'Frozen'] }
        ]
    },
    {
        name: 'Pharmacy',
        slug: 'pharmacy',
        icon: 'LocalPharmacy',
        dropdownGroups: [
            { name: 'Medicine Type', slug: 'medicine_type', options: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Powder'] },
            { name: 'Schedule Type', slug: 'schedule_type', options: ['OTC', 'Schedule H', 'Schedule X'] },
            { name: 'Prescription', slug: 'prescription', options: ['Required', 'Not Required'] },
            { name: 'Storage', slug: 'storage', options: ['Cool Place', 'Refrigerated', 'Avoid Sunlight'] }
        ]
    },
    {
        name: 'Restaurant',
        slug: 'restaurant',
        icon: 'Restaurant',
        dropdownGroups: [
            { name: 'Food Type', slug: 'food_type', options: ['Veg', 'Non Veg', 'Vegan', 'Jain'] },
            { name: 'Spice Level', slug: 'spice_level', options: ['Mild', 'Medium', 'Spicy', 'Extra Spicy'] },
            { name: 'Serving Size', slug: 'serving_size', options: ['Half', 'Full', 'Family Pack'] },
            { name: 'Order Type', slug: 'order_type', options: ['Dine In', 'Takeaway', 'Delivery'] }
        ]
    },
    {
        name: 'Automobile',
        slug: 'automobile',
        icon: 'DirectionsCar',
        dropdownGroups: [
            { name: 'Fuel Type', slug: 'fuel_type', options: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'] },
            { name: 'Vehicle Type', slug: 'vehicle_type', options: ['Bike', 'Car', 'Truck', 'Bus'] },
            { name: 'Transmission', slug: 'transmission', options: ['Manual', 'Automatic'] },
            { name: 'Ownership', slug: 'ownership', options: ['First Owner', 'Second Owner', 'Third Owner'] }
        ]
    },
    {
        name: 'Services',
        slug: 'services',
        icon: 'Engineering',
        dropdownGroups: [
            { name: 'Service Type', slug: 'service_type', options: ['Installation', 'Repair', 'Maintenance', 'Consulting', 'Development'] },
            { name: 'Billing Type', slug: 'billing_type', options: ['Hourly', 'Daily', 'Fixed Price', 'Milestone'] },
            { name: 'SLA Level', slug: 'sla_level', options: ['Basic', 'Standard', 'Premium'] }
        ]
    },
    {
        name: 'Education',
        slug: 'education',
        icon: 'School',
        dropdownGroups: [
            { name: 'Course Mode', slug: 'course_mode', options: ['Online', 'Offline', 'Hybrid'] },
            { name: 'Course Level', slug: 'course_level', options: ['Beginner', 'Intermediate', 'Advanced'] },
            { name: 'Duration', slug: 'duration', options: ['1 Month', '3 Months', '6 Months', '1 Year'] }
        ]
    },
    {
        name: 'Real Estate',
        slug: 'real-estate',
        icon: 'HomeWork',
        dropdownGroups: [
            { name: 'Property Type', slug: 'property_type', options: ['Apartment', 'Villa', 'Plot', 'Commercial'] },
            { name: 'Furnishing', slug: 'furnishing', options: ['Fully Furnished', 'Semi Furnished', 'Unfurnished'] },
            { name: 'Facing', slug: 'facing', options: ['East', 'West', 'North', 'South'] }
        ]
    },
    {
        name: 'Healthcare',
        slug: 'healthcare',
        icon: 'HealthAndSafety',
        dropdownGroups: [
            { name: 'Service Type', slug: 'service_type', options: ['Diagnostic', 'Consultation', 'Therapy', 'Surgery'] },
            { name: 'Lab Required', slug: 'lab_required', options: ['Required', 'Not Required'] }
        ]
    },
    {
        name: 'Logistics',
        slug: 'logistics',
        icon: 'LocalShipping',
        dropdownGroups: [
            { name: 'Travel Type', slug: 'travel_type', options: ['Air', 'Road', 'Rail', 'Sea'] }
        ]
    },
    {
        name: 'Manufacturing',
        slug: 'manufacturing',
        icon: 'PrecisionManufacturing',
        dropdownGroups: [
            { name: 'Production Status', slug: 'production_status', options: ['In Production', 'Completed', 'Quality Check', 'Dispatched'] },
            { name: 'Quality Grade', slug: 'quality_grade', options: ['A', 'B', 'C'] },
            { name: 'Machine Type', slug: 'machine_type', options: ['Automatic', 'Semi Automatic', 'Manual'] }
        ]
    },
    {
        name: 'Hospitality',
        slug: 'hospitality',
        icon: 'Hotel',
        dropdownGroups: [
            { name: 'Room Type', slug: 'room_type', options: ['Single', 'Double', 'Deluxe', 'Suite'] }
        ]
    },
    {
        name: 'Textile',
        slug: 'textile',
        icon: 'Checkroom',
        dropdownGroups: [
            { name: 'Size', slug: 'size', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
            { name: 'Fabric Type', slug: 'fabric_type', options: ['Cotton', 'Silk', 'Denim', 'Polyester', 'Wool'] },
            { name: 'Pattern', slug: 'pattern', options: ['Solid', 'Striped', 'Checked', 'Printed'] }
        ]
    },
    {
        name: 'FMCG',
        slug: 'fmcg',
        icon: 'ShoppingBasket',
        dropdownGroups: [
            { name: 'Weight', slug: 'weight', options: ['1kg', '2kg', '5kg', '10kg', '250g', '500g'] }
        ]
    },
    {
        name: 'Jewellery',
        slug: 'jewellery',
        icon: 'Diamond',
        dropdownGroups: [
            { name: 'Purity', slug: 'purity', options: ['18K', '22K', '24K'] },
            { name: 'Jewelry Type', slug: 'jewelry_type', options: ['Ring', 'Necklace', 'Bracelet', 'Earrings'] },
            { name: 'Stone Type', slug: 'stone_type', options: ['Diamond', 'Ruby', 'Emerald', 'None'] },
            { name: 'Stone Certificate', slug: 'stone_certificate', options: ['GIA', 'IGI', 'None'] }
        ]
    },
    {
        name: 'Gym & Fitness',
        slug: 'gym',
        icon: 'FitnessCenter',
        dropdownGroups: [
            { name: 'Membership Duration', slug: 'membership_duration', options: ['Monthly', 'Quarterly', 'Half Yearly', 'Yearly'] },
            { name: 'Workout Type', slug: 'workout_type', options: ['Cardio', 'Strength', 'Crossfit', 'Yoga'] },
            { name: 'Trainer Type', slug: 'trainer_type', options: ['General', 'Personal Trainer'] }
        ]
    },
    {
        name: 'Salon & Spa',
        slug: 'salon',
        icon: 'ContentCut',
        dropdownGroups: [
            { name: 'Appointment Type', slug: 'appointment_type', options: ['Hair', 'Facial', 'Bridal', 'Massage'] }
        ]
    },
    {
        name: 'Hardware',
        slug: 'hardware',
        icon: 'Handyman',
        dropdownGroups: [
            { name: 'Tool Type', slug: 'tool_type', options: ['Power Tool', 'Hand Tool', 'Industrial Tool'] },
            { name: 'Voltage Rating', slug: 'voltage_rating', options: ['110V', '220V', '440V'] },
            { name: 'Safety Certification', slug: 'safety_certification', options: ['CE', 'UL', 'None'] },
            { name: 'Usage', slug: 'usage', options: ['Domestic', 'Commercial', 'Industrial'] }
        ]
    },
    {
        name: 'Furniture',
        slug: 'furniture',
        icon: 'Chair',
        dropdownGroups: [
            { name: 'Material', slug: 'material', options: ['Teak Wood', 'Metal', 'Plastic', 'Glass', 'Engineered Wood'] },
            { name: 'Size', slug: 'size', options: ['Single', 'Double', 'King', 'Queen'] }
        ]
    },
    {
        name: 'Mobile Shop',
        slug: 'mobile-shop',
        icon: 'Smartphone',
        dropdownGroups: [
            { name: 'Warranty Period', slug: 'warranty_period', options: ['6 Months', '1 Year', '2 Years'] }
        ]
    }
]

async function main() {
    console.log('🌱 Seeding 21 industries...')

    for (const data of industryData) {
        console.log(`Processing industry: ${data.name}...`)

        // 1. Create Industry
        const industry = await prisma.industryMaster.upsert({
            where: { slug: data.slug },
            update: { name: data.name, icon: data.icon },
            create: {
                name: data.name,
                slug: data.slug,
                icon: data.icon,
                isActive: true
            }
        })

        // 2. Create Dropdown Groups and Options
        for (const groupData of data.dropdownGroups) {
            const group = await prisma.industryDropdownGroup.upsert({
                where: {
                    industryId_slug: {
                        industryId: industry.id,
                        slug: groupData.slug
                    }
                },
                update: { name: groupData.name },
                create: {
                    industryId: industry.id,
                    name: groupData.name,
                    slug: groupData.slug
                }
            })

            // Delete existing options for clean seed
            await prisma.industryDropdownOption.deleteMany({
                where: { groupId: group.id }
            });

            // Create Options
            for (let i = 0; i < groupData.options.length; i++) {
                const optionLabel = groupData.options[i]
                await prisma.industryDropdownOption.create({
                    data: {
                        groupId: group.id,
                        label: optionLabel,
                        value: optionLabel.toLowerCase().replace(/\s+/g, '_'),
                        order: i,
                        isActive: true
                    }
                })
            }

            // 3. Create Form Field for this dropdown
            await prisma.industryFormField.upsert({
                where: {
                    industryId_entity_name: {
                        industryId: industry.id,
                        entity: 'product',
                        name: groupData.slug
                    }
                },
                update: {
                    label: groupData.name,
                    dataType: 'dropdown',
                    groupId: group.id
                },
                create: {
                    industryId: industry.id,
                    entity: 'product',
                    name: groupData.slug,
                    label: groupData.name,
                    dataType: 'dropdown',
                    groupId: group.id,
                    isActive: true,
                    order: 0
                }
            })
        }
    }

    console.log('✅ Seeding 21 industries completed successfully!')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
