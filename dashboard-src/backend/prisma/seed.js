import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    // Create Admin
    const admin = await prisma.user.create({
        data: {
            email: 'admin@learnsphere.com',
            passwordHash: 'hashed_password_123', // In real app, use bcrypt
            name: 'Alice Admin',
            role: 'admin',
        },
    })

    // Create Teacher
    const teacher = await prisma.user.create({
        data: {
            email: 'sarah@learnsphere.com',
            passwordHash: 'hashed_password_123',
            name: 'Sarah Teacher',
            role: 'teacher',
        },
    })

    // Create Student
    const student = await prisma.user.create({
        data: {
            email: 'john@student.com',
            passwordHash: 'hashed_password_123',
            name: 'John Student',
            role: 'user',
            points: 45,
            rank: 'Achiever',
        },
    })

    // Create Course by Teacher
    const course = await prisma.course.create({
        data: {
            title: 'Modern Web Development',
            slug: 'modern-web-development',
            description: 'Learn React, Node, and more.',
            status: 'published',
            adminId: teacher.id,
            modules: {
                create: {
                    title: 'Introduction',
                    lessons: {
                        create: {
                            title: 'Welcome to React',
                            type: 'video',
                            contentUrl: 'https://vimeo.com/123',
                            basePoints: 100,
                        }
                    }
                }
            }
        },
    })

    console.log({ admin, teacher, student, course })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
