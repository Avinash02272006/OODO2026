import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding courses...');

    // Find or create admin
    let admin = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (!admin) {
        admin = await prisma.user.create({
            data: {
                email: 'admin@learnsphere.com',
                name: 'Master Architect',
                passwordHash: '$2a$12$K8M9V4z0y2e1C4r6u8O9O.e1C4r6u8O9O.e1C4r6u8O9O.e1C4r6u8O9O.', // dummy
                role: 'admin',
                points: 1000,
                rank: 'Expert'
            }
        });
    }

    const courses = [
        {
            title: 'Advanced CRM Architectures',
            slug: 'advanced-crm-architectures',
            subtitle: 'Mastering Odoo & SAP workflows',
            description: 'A deep dive into the technical implementation of CRM modules for enterprise-level organizations.',
            status: 'published',
            tags: 'ERP, Odoo, Architecture',
            thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80',
            adminId: admin.id
        },
        {
            title: 'UI/UX for Enterprise Applications',
            slug: 'ui-ux-enterprise',
            subtitle: 'Designing for productivity',
            description: 'Learn how to design complex dashboard environments that prioritize user efficiency and clarity.',
            status: 'published',
            tags: 'Design, UX, Dashboards',
            thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80',
            adminId: admin.id
        },
        {
            title: 'Scaled Agile Framework (SAFe)',
            slug: 'scaled-agile-framework',
            subtitle: 'Enterprise agility at scale',
            description: 'Understanding how to implement agile methodologies across large organizations with multiple teams.',
            status: 'published',
            tags: 'Agile, Management, Scale',
            thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80',
            adminId: admin.id
        },
        {
            title: 'Financial Accounting in Odoo',
            slug: 'financial-accounting-odoo',
            subtitle: 'Precision and compliance',
            description: 'A comprehensive guide to managing balance sheets, P&L, and tax compliance within the Odoo ecosystem.',
            status: 'published',
            tags: 'Accounting, Finance, Odoo',
            thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80',
            adminId: admin.id
        }
    ];

    for (const courseData of courses) {
        await prisma.course.upsert({
            where: { slug: courseData.slug },
            update: courseData,
            create: courseData
        });
    }

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
