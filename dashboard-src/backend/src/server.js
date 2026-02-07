import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();
const prisma = new PrismaClient(); // DB Connection
const JWT_SECRET = process.env.JWT_SECRET || "learnsphere-super-secret-key";

app.use(cors());
app.use(express.json());

// ----------------------
// MIDDLEWARE: RBAC Gatekeeper
// ----------------------
const authenticate = async (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
        // Development fallback if no token provided (simulating easy access during dev)
        if (process.env.NODE_ENV === 'development') {
            // Mock user based on header for testing without login flow if needed
            // But better to enforce login. Let's enforce it now as requested.
            return res.status(401).json({ error: "Access Denied: No Token Provided" });
        }
        return res.status(401).json({ error: "Access Denied: No Token Provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ error: "Invalid Token" });
    }
};

const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Access Denied: Insufficient Permissions" });
        }
        next();
    };
};

// ----------------------
// AUTHENTICATION (Unified Login & Register)
// ----------------------

// Helper: Password Complexity Check
const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasSpecialChar;
};

app.post("/api/register", async (req, res) => {
    const { name, email, password } = req.body;

    // 1. Duplicate Check
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return res.status(400).json({ error: "Email ID is a duplicate in database." });
    }

    // 2. Password Validation (Strict)
    if (!validatePassword(password)) {
        return res.status(400).json({
            error: "Password must be >8 chars, contain Uppercase, Lowercase, and Special Character."
        });
    }

    // 3. Create User with Bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    try {
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: 'user', // Default to Learner
                points: 0,
                rank: 'Newbie'
            }
        });

        // Auto-login after register
        const token = jwt.sign(
            { id: newUser.id, role: newUser.role, name: newUser.name },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token, user: { id: newUser.id, name: newUser.name, role: newUser.role, points: 0, rank: 'Newbie' } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error during registration" });
    }
});

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(404).json({ error: "User not found" });

    // HYBRID AUTH: Support real bcrypt users AND legacy demo users
    let validPassword = false;

    if (user.passwordHash.startsWith('$2a$') || user.passwordHash.startsWith('$2b$')) {
        // Real Bcrypt Hash
        validPassword = await bcrypt.compare(password, user.passwordHash);
    } else {
        // Legacy/Demo Seed (Plaintext check for 'password' or direct string match if we seeded that)
        // The seed used 'hashed_password_123'. For demo convenience, we allow 'password' to match the seed users.
        if (password === 'password') validPassword = true;
    }

    if (!validPassword) return res.status(401).json({ error: "Invalid Credentials" });

    const token = jwt.sign(
        { id: user.id, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: "1d" }
    );

    res.json({ token, user: { id: user.id, name: user.name, role: user.role, points: user.points, rank: user.rank } });
});


// ----------------------
// MODULE: COURSES (CRUD + Filtering)
// ----------------------
app.get("/api/courses", authenticate, async (req, res) => {
    // Visibility Filter
    // Admin/Teacher see all (but marked ownership). Learners see only published.

    let whereClause = {};
    if (req.user.role === 'user') {
        whereClause = { status: "published", visibility: { in: ['everyone', 'signed_in'] } };
    }

    const courses = await prisma.course.findMany({
        where: whereClause,
        include: {
            admin: { select: { name: true } },
            _count: { select: { lessons: true, enrollments: true } }
        }
    });

    // Transform for frontend ownership flag
    const enriched = courses.map(c => ({
        ...c,
        isOwner: (req.user.role === 'admin' || c.adminId === req.user.id),
        image: c.thumbnail || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085' // Fallback
    }));

    res.json(enriched);
});

// Update Course (Owner Policy)
app.put("/api/courses/:id", authenticate, authorize(["admin", "teacher"]), async (req, res) => {
    const { id } = req.params;
    const course = await prisma.course.findUnique({ where: { id } });

    if (!course) return res.status(404).json({ error: "Course not found" });

    // STRICT OWNERSHIP CHECK
    if (req.user.role === "teacher" && course.adminId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized: You do not own this course." });
    }

    const updated = await prisma.course.update({
        where: { id },
        data: req.body
    });
    res.json(updated);
});


// ----------------------
// MODULE: GAMIFICATION (Advanced Logic)
// ----------------------
app.post("/api/quiz/:lessonId/submit", authenticate, async (req, res) => {
    const { lessonId } = req.params;
    const { score } = req.body;

    // 1. Check previous attempts
    const attempts = await prisma.quizAttempts.count({ where: { userId: req.user.id, lessonId } });
    const attemptNumber = attempts + 1;

    // 2. Fetch Base Points
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });

    // 3. Logic: Points = MaxPoints * (0.5 ^ (Attempt-1))
    // Attempt 1: 100 * 1 = 100
    // Attempt 2: 100 * 0.5 = 50
    // Attempt 3: 100 * 0.25 = 25
    let pointsAwarded = 0;
    if (score >= 70) {
        const multiplier = Math.pow(0.5, attemptNumber - 1);
        pointsAwarded = Math.floor(lesson.basePoints * multiplier);
    }

    // 4. Atomic Update
    const result = await prisma.$transaction(async (tx) => {
        const attempt = await tx.quizAttempts.create({
            data: { userId: req.user.id, lessonId, score, attemptNumber, pointsEarned: pointsAwarded }
        });

        if (pointsAwarded > 0) {
            const user = await tx.user.update({
                where: { id: req.user.id },
                data: { points: { increment: pointsAwarded } }
            });

            // Industrial Rank System
            let newRank = user.rank;
            if (user.points >= 120) newRank = "Master";
            else if (user.points >= 100) newRank = "Expert";
            else if (user.points >= 80) newRank = "Specialist";
            else if (user.points >= 60) newRank = "Achiever";
            else if (user.points >= 40) newRank = "Explorer";

            if (newRank !== user.rank) {
                await tx.user.update({ where: { id: req.user.id }, data: { rank: newRank } });
            }
            return { attempt, newRank, totalPoints: user.points };
        }
        return { attempt, totalPoints: 0 };
    });

    res.json(result);
});

// ----------------------
// MODULE: ANALYTICS (Teacher Dashboard)
// ----------------------
app.get("/api/analytics/teacher", authenticate, authorize(["admin", "teacher"]), async (req, res) => {
    // Calculate "Yet to Start", "In Progress", "Completed"
    // Mock logic for demo as strict SQL counts would require complex joins on user progress
    // In production: join UserProgress with Enrollment

    const stats = {
        totalLearners: await prisma.user.count({ where: { role: 'user' } }),
        activeCourses: await prisma.course.count({ where: { status: 'published' } }),
        averageCompletion: 42 // Mock for demo until real progress data flows
    };
    res.json(stats);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`LearnSphere Industrial Backend running on port ${PORT}`);
});
