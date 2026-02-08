import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('password', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@learnsphere.com' },
        update: {},
        create: {
            email: 'admin@learnsphere.com',
            name: 'Admin User',
            passwordHash,
            role: 'admin',
        },
    });

    const instructor = await prisma.user.upsert({
        where: { email: 'instructor@learnsphere.com' },
        update: {},
        create: {
            email: 'instructor@learnsphere.com',
            name: 'Jane Doe',
            passwordHash,
            role: 'teacher',
        },
    });

    const course1 = await prisma.course.upsert({
        where: { slug: 'react-masterclass' },
        update: {},
        create: {
            title: 'React Masterclass 2024',
            slug: 'react-masterclass',
            description: 'The ultimate guide to React.',
            thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop',
            status: 'published',
            adminId: admin.id,
            visibility: 'everyone',
            tags: 'React,Frontend,JavaScript'
        },
    });

    // Create Module and Lessons for Course 1
    const module1 = await prisma.module.create({
        data: {
            title: 'Introduction to React',
            courseId: course1.id,
            orderIndex: 0,
            lessons: {
                create: [
                    {
                        title: 'Welcome to the Course',
                        type: 'video',
                        contentUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
                        description: 'Introduction to React and what we will build.',
                        duration: 10,
                        orderIndex: 0
                    },
                    {
                        title: 'Setup Environment',
                        type: 'document',
                        description: 'How to install Node.js and create a React app.',
                        duration: 15,
                        orderIndex: 1
                    }
                ]
            }
        }
    });


    const course2 = await prisma.course.upsert({
        where: { slug: 'python-backend-development' },
        update: {},
        create: {
            title: 'Python Backend Development',
            slug: 'python-backend-development',
            description: 'Learn FastAPI and Django.',
            thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?q=80&w=2000&auto=format&fit=crop',
            status: 'published',
            adminId: instructor.id,
            visibility: 'everyone',
            tags: 'Python,Backend,FastAPI'
        },
    });

    console.log({ admin, instructor, course1, course2, module1 });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
