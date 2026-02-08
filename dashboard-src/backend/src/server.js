import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
    console.error("CRITICAL: JWT_SECRET not set in production!");
    process.exit(1);
}

const SECRET = JWT_SECRET || "learnsphere-dev-secret-key";

// --- PRODUCTION HARDENING ---
app.use(helmet({
    crossOriginResourcePolicy: false, // Required for serving images from /uploads
}));
app.use(compression());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiter specifically to API and Auth routes
app.use("/api/", limiter);

// Ensure module directory and uploads directory exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// Request Logger
app.use((req, res, next) => {
    if (process.env.NODE_ENV !== 'test') {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
});

// ----------------------
// MIDDLEWARE: SECURITY
// ----------------------
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const decoded = jwt.verify(token, SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user) {
            return res.status(401).json({ error: "User no longer exists" });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};

const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
        }
        next();
    };
};

// ----------------------
// AUTHENTICATION
// ----------------------
const validatePassword = (password) => {
    return password.length >= 6; // Balance between security and UX for MVP
};

app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: 'user',
                points: 0,
                rank: 'Newbie'
            }
        });

        const token = jwt.sign(
            { id: newUser.id, role: newUser.role },
            SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            token,
            user: { id: newUser.id, name: newUser.name, role: newUser.role, points: 0, rank: 'Newbie' }
        });

    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            SECRET,
            { expiresIn: "7d" }
        );

        res.json({ token, user: { id: user.id, name: user.name, role: user.role, points: user.points, rank: user.rank } });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ----------------------
// USER PROFILE
// ----------------------
app.get("/api/user/profile", authenticate, async (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        bio: req.user.bio,
        points: req.user.points,
        rank: req.user.rank,
        level: req.user.level
    });
});

app.put("/api/user/profile", authenticate, async (req, res) => {
    try {
        const { name, avatar, bio, currentPassword, newPassword } = req.body;

        const data = {};
        if (name) data.name = name;
        if (avatar) data.avatar = avatar;
        if (bio !== undefined) data.bio = bio;

        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: "Current password required to set new password" });
            }
            const valid = await bcrypt.compare(currentPassword, req.user.passwordHash);
            if (!valid) {
                return res.status(400).json({ error: "Invalid current password" });
            }
            const salt = await bcrypt.genSalt(12);
            data.passwordHash = await bcrypt.hash(newPassword, salt);
        }

        const updated = await prisma.user.update({
            where: { id: req.user.id },
            data
        });

        const { passwordHash, ...userWithoutPassword } = updated;
        res.json({ user: userWithoutPassword });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update profile" });
    }
});

// ----------------------
// UPLOAD
// ----------------------
app.post("/api/upload", authenticate, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const baseUrl = process.env.UPLOAD_URL || `http://localhost:${process.env.PORT || 3000}`;
    const url = `${baseUrl}/uploads/${req.file.filename}`;
    res.json({ url });
});

// ----------------------
// MODULE: COURSES
// ----------------------
app.get("/api/courses", authenticate, async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            where: req.user.role === 'user' ? { status: "published" } : {},
            include: {
                admin: { select: { name: true } },
                _count: { select: { enrollments: true, modules: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Enrich with lessons count and enrollment status
        const enriched = await Promise.all(courses.map(async (c) => {
            const lessonsCount = await prisma.lesson.count({
                where: { module: { courseId: c.id } }
            });
            const enrollment = await prisma.enrollment.findUnique({
                where: { userId_courseId: { userId: req.user.id, courseId: c.id } }
            });

            return {
                ...c,
                lessonsCount,
                isEnrolled: !!enrollment,
                progress: enrollment?.progressPercent || 0,
                image: c.thumbnail || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085'
            };
        }));

        res.json(enriched);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch courses" });
    }
});

app.get("/api/courses/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                modules: {
                    include: { lessons: { orderBy: { orderIndex: 'asc' } } },
                    orderBy: { orderIndex: 'asc' }
                },
                reviews: {
                    include: { user: { select: { name: true, avatar: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                _count: { select: { enrollments: true } }
            }
        });

        if (!course) return res.status(404).json({ error: "Course not found" });

        const enrollment = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId: req.user.id, courseId: id } }
        });

        // Get progress for each lesson
        const progress = await prisma.userProgress.findMany({
            where: { userId: req.user.id, lesson: { module: { courseId: id } } }
        });

        const progressMap = progress.reduce((acc, curr) => {
            acc[curr.lessonId] = curr.isCompleted;
            return acc;
        }, {});

        res.json({
            ...course,
            lessons: course.modules.flatMap(m => m.lessons), // Flatten for editor
            isEnrolled: !!enrollment,
            enrollmentStatus: enrollment?.status,
            progressMap
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch course details" });
    }
});

app.put("/api/courses/:id", authenticate, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, thumbnail, status, tags, visibility, accessRule, price } = req.body;

        const updated = await prisma.course.update({
            where: { id },
            data: {
                title,
                description,
                thumbnail,
                status,
                tags,
                visibility,
                accessRule,
                price
            }
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: "Failed to update course" });
    }
});

app.delete("/api/courses/:id", authenticate, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.course.delete({ where: { id } });
        res.json({ success: true, message: "Course deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete course" });
    }
});

app.post("/api/courses/:id/enroll", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const course = await prisma.course.findUnique({ where: { id } });

        if (!course) return res.status(404).json({ error: "Course not found" });
        if (course.status !== 'published' && req.user.role === 'user') {
            return res.status(403).json({ error: "Course not available" });
        }

        const enrollment = await prisma.enrollment.upsert({
            where: { userId_courseId: { userId: req.user.id, courseId: id } },
            update: { status: 'active' },
            create: { userId: req.user.id, courseId: id, status: 'active' }
        });

        res.json(enrollment);
    } catch (err) {
        res.status(500).json({ error: "Enrollment failed" });
    }
});

// LESSON MANAGEMENT
app.post("/api/courses/:id/lessons", authenticate, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, type, contentUrl, description, duration, allowDownload } = req.body;

        // Ensure at least one module exists
        let module = await prisma.module.findFirst({ where: { courseId: id } });
        if (!module) {
            module = await prisma.module.create({
                data: { title: "General", courseId: id, orderIndex: 0 }
            });
        }

        const lesson = await prisma.lesson.create({
            data: {
                title,
                type,
                contentUrl,
                description,
                duration: parseInt(duration) || 0,
                allowDownload: !!allowDownload,
                moduleId: module.id
            }
        });
        res.json(lesson);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create lesson" });
    }
});

app.put("/api/lessons/:id", authenticate, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, type, contentUrl, description, duration, allowDownload } = req.body;

        const updated = await prisma.lesson.update({
            where: { id },
            data: {
                title,
                type,
                contentUrl,
                description,
                duration: parseInt(duration) || 0,
                allowDownload: !!allowDownload
            }
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: "Failed to update lesson" });
    }
});

app.delete("/api/lessons/:id", authenticate, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.lesson.delete({ where: { id } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete lesson" });
    }
});

// ----------------------
// MODULE: PROGRESS & COMPLETION
// ----------------------
app.post("/api/lessons/:id/complete", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const lesson = await prisma.lesson.findUnique({
            where: { id },
            include: { module: true }
        });

        if (!lesson) return res.status(404).json({ error: "Lesson not found" });

        await prisma.userProgress.upsert({
            where: { userId_lessonId: { userId: req.user.id, lessonId: id } },
            update: { isCompleted: true, completedAt: new Date() },
            create: { userId: req.user.id, lessonId: id, isCompleted: true, completedAt: new Date() }
        });

        // Update global course progress
        const courseId = lesson.module.courseId;
        const totalLessons = await prisma.lesson.count({ where: { module: { courseId } } });
        const completedLessons = await prisma.userProgress.count({
            where: { userId: req.user.id, isCompleted: true, lesson: { module: { courseId } } }
        });

        const percent = Math.round((completedLessons / totalLessons) * 100);
        await prisma.enrollment.update({
            where: { userId_courseId: { userId: req.user.id, courseId } },
            data: { progressPercent: percent, status: percent === 100 ? 'completed' : 'active' }
        });

        // Award points if first time
        const points = lesson.basePoints || 10;
        await prisma.user.update({
            where: { id: req.user.id },
            data: { points: { increment: points } }
        });

        res.json({ success: true, pointsAwarded: points, progress: percent });
    } catch (err) {
        res.status(500).json({ error: "Failed to mark as complete" });
    }
});

// ----------------------
// MODULE: REVIEWS
// ----------------------
app.post("/api/courses/:id/reviews", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, text } = req.body;

        if (!rating || !text) return res.status(400).json({ error: "Rating and text required" });

        const review = await prisma.review.create({
            data: {
                rating: parseInt(rating),
                text,
                userId: req.user.id,
                courseId: id
            },
            include: { user: { select: { name: true, avatar: true } } }
        });

        res.json(review);
    } catch (err) {
        res.status(500).json({ error: "Failed to post review" });
    }
});

// ----------------------
// QUIZ SUBMISSION
// ----------------------
app.post("/api/quiz/:lessonId/submit", authenticate, async (req, res) => {
    try {
        const { lessonId } = req.params;
        const { score } = req.body;

        const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
        if (!lesson) return res.status(404).json({ error: "Quiz not found" });

        const attempts = await prisma.quizAttempts.count({ where: { userId: req.user.id, lessonId } });
        const pointsAwarded = score >= 80 ? Math.floor(lesson.basePoints * Math.pow(0.7, attempts)) : 0;

        const result = await prisma.$transaction(async (tx) => {
            const attempt = await tx.quizAttempts.create({
                data: { userId: req.user.id, lessonId, score, attemptNumber: attempts + 1, pointsEarned: pointsAwarded }
            });

            if (pointsAwarded > 0) {
                const user = await tx.user.update({
                    where: { id: req.user.id },
                    data: { points: { increment: pointsAwarded } }
                });

                // Rank logic
                let newRank = user.rank;
                if (user.points >= 1000) newRank = "Master";
                else if (user.points >= 500) newRank = "Expert";
                else if (user.points >= 200) newRank = "Specialist";
                else if (user.points >= 100) newRank = "Achiever";
                else if (user.points >= 50) newRank = "Explorer";

                if (newRank !== user.rank) {
                    await tx.user.update({ where: { id: req.user.id }, data: { rank: newRank, level: { increment: 1 } } });
                }

                // Mark quiz as completed
                await tx.userProgress.upsert({
                    where: { userId_lessonId: { userId: req.user.id, lessonId } },
                    update: { isCompleted: true },
                    create: { userId: req.user.id, lessonId, isCompleted: true }
                });

                return { attempt, newRank, totalPoints: user.points + pointsAwarded };
            }
            return { attempt, totalPoints: req.user.points };
        });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Quiz submission failed" });
    }
});

// ----------------------
// TEACHER ANALYTICS
// ----------------------
app.get("/api/analytics/teacher", authenticate, authorize(["admin", "teacher"]), async (req, res) => {
    try {
        const stats = {
            totalLearners: await prisma.user.count({ where: { role: 'user' } }),
            activeCourses: await prisma.course.count({ where: { status: 'published' } }),
            totalEnrollments: await prisma.enrollment.count(),
            popularCourses: await prisma.course.findMany({
                take: 5,
                include: { _count: { select: { enrollments: true } } },
                orderBy: { enrollments: { _count: 'desc' } }
            })
        };
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: "Analytics failed" });
    }
});

// ----------------------
// MODULE: USER MANAGEMENT
// ----------------------
app.get("/api/users", authenticate, authorize(['admin']), async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                points: true,
                rank: true
            }
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

app.patch("/api/users/:id", authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { role, status, points } = req.body;
        const updated = await prisma.user.update({
            where: { id },
            data: { role, status, points: points !== undefined ? parseInt(points) : undefined }
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: "Failed to update user" });
    }
});

app.delete("/api/users/:id", authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        if (id === req.user.id) return res.status(400).json({ error: "Cannot delete yourself" });
        await prisma.user.delete({ where: { id } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete user" });
    }
});

app.get("/api/analytics/enrollments", authenticate, authorize(['admin', 'teacher']), async (req, res) => {
    try {
        const enrollments = await prisma.enrollment.findMany({
            include: {
                user: { select: { name: true, email: true } },
                course: { select: { title: true } }
            },
            orderBy: { joinedAt: 'desc' }
        });
        res.json(enrollments);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch enrollments" });
    }
});

// Final Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err);
    res.status(500).json({
        error: process.env.NODE_ENV === 'production' ? "Internal server error" : err.message
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`LearnSphere Industrial Backend running on port ${PORT}`);
});

