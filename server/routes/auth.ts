import express, { Request, Response } from 'express';
import databaseService from '../database/prismaService';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

router.use(cookieParser());

// Login API - Frontend calls this instead of Firebase directly

router.post("/login", async (req: Request, res: Response) => {
    const { identifier, password } = req.body; // Can be either email or username

    if (!identifier || !password) {
        return res.status(400).json({ success: false, message: "Email/Username and password are required." });
    }

    try {
        let user;

        // 🔹 Check if identifier is an email or username
        if (identifier.includes("@")) {
            user = await databaseService.getUserByEmail(identifier);
        } else {
            user = await databaseService.getUserByUsername(identifier);
        }

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid username/email or password." });
        }

        // 🔹 Verify password
        const isValidPassword = await databaseService.verifyPassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: "Invalid username/email or password." });
        }

        // 🔹 Generate JWT Token
        const token = jwt.sign({ uid: user.id }, SECRET_KEY, { expiresIn: "1h" });

        // 🔹 Set JWT Token in HTTP-only Cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // Change to true in production with HTTPS
            maxAge: 3600000 // 1 hour expiration
        });

        res.json({ success: true });

    } catch (error: any) {
        console.error("❌ LOGIN ERROR:", error);
        res.status(401).json({ success: false, message: "Authentication failed", error: error.message });
    }
});

router.post("/signup", async (req: Request, res: Response) => {
    // Check if we've reached the user limit
    const userCount = await databaseService.getUserCount();
    if (userCount >= 15) {
        return res.status(400).json({ success: false, message: "Sign-ups are currently closed. Maximum number of accounts reached." });
    }

    const { username, email, password, gender } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: "Username, email, and password are required." });
    }

    // ✅ Validate username format (only lowercase, numbers, underscores, 3-14 chars)
    const usernameRegex = /^[a-z0-9_]{3,14}$/;
    if (!usernameRegex.test(username)) {
        return res.status(400).json({ success: false, message: "Invalid username format." });
    }

    // ✅ Validate password length
    if (password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
    }

    try {
        // 🔹 Check if username is already taken
        const isUsernameAvailable = await databaseService.checkUsernameAvailable(username);
        if (!isUsernameAvailable) {
            return res.status(400).json({ success: false, message: "Username is already taken." });
        }

        // 🔹 Check if email is already registered
        const isEmailAvailable = await databaseService.checkEmailAvailable(email);
        if (!isEmailAvailable) {
            return res.status(400).json({ success: false, message: "Email is already in use." });
        }

        // 🔹 Create user in database
        console.log("Creating new account, gender is", gender);
        
        const user = await databaseService.createUser({
            username,
            email,
            password,
            gender: gender || "female"
        });

        res.status(201).json({ success: true, message: "User created successfully." });

    } catch (error: any) {
        console.error("❌ SIGNUP ERROR:", error);
        
        res.status(500).json({ success: false, message: "Error creating user.", error: error.message });
    }
});

router.get("/check-username/:username", async (req: Request, res: Response) => {
    const { username } = req.params;

    // ✅ Validate username format
    const usernameRegex = /^[a-z0-9_]{3,14}$/;
    if (!usernameRegex.test(username)) {
        return res.status(400).json({ available: false, message: "Invalid username format." });
    }

    try {
        // 🔹 Check if username exists in the database
        const isAvailable = await databaseService.checkUsernameAvailable(username);
        return res.json({ available: isAvailable });
    } catch (error: any) {
        console.error("❌ USERNAME CHECK ERROR:", error);
        res.status(500).json({ available: false, message: "Error checking username." });
    }
});

export default router;
