import express, { Request, Response } from 'express';
import { auth, db } from "../firebase/firebaseAdmin";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

router.use(cookieParser());

// Login API - Frontend calls this instead of Firebase directly
router.post("/login", async (req: Request, res: Response) => {
    const { identifier, password }: { identifier: string; password: string } = req.body; // Can be either email or username

    if (!identifier || !password) {
        return res.status(400).json({ success: false, message: "Email/Username and password are required." });
    }

    try {
        let email = identifier; // Assume identifier is an email

        // 🔹 If identifier does NOT contain '@', treat it as a username and fetch the email
        if (!identifier.includes("@")) {
            const usernameRef = db.ref(`usernames/${identifier}`);
            const snapshot = await usernameRef.once("value");

            if (!snapshot.exists()) {
                return res.status(401).json({ success: false, message: "Invalid username or password." });
            }

            email = snapshot.val(); // Retrieve associated email
        }

        // 🔹 Authenticate with Firebase using email
        const userRecord = await auth.getUserByEmail(email);

        if (!userRecord) {
            return res.status(401).json({ success: false, message: "User not found." });
        }

        // 🔹 Generate JWT Token
        const token = jwt.sign({ uid: userRecord.uid }, SECRET_KEY, { expiresIn: "1h" });

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

interface SignupBody {
    username: string;
    email: string;
    password: string;
}

router.post("/signup", async (req: Request<{}, {}, SignupBody>, res: Response) => {
    const usersRef = db.ref("users");
    const usersSnapshot = await usersRef.once("value");

    if (usersSnapshot.exists() && Object.keys(usersSnapshot.val()).length >= 15) {
        return res.status(400).json({ success: false, message: "Sign-ups are currently closed. Maximum number of accounts reached." });
    }

    const { username, email, password } = req.body;

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
        const usernameRef = db.ref(`usernames/${username}`);
        const snapshot = await usernameRef.once("value");

        if (snapshot.exists()) {
            return res.status(400).json({ success: false, message: "Username is already taken." });
        }

        // 🔹 Check if email is already registered
        const emailSnapshot = await db.ref("emails").orderByValue().equalTo(email).once("value");
        if (emailSnapshot.exists()) {
            return res.status(400).json({ success: false, message: "Email is already in use." });
        }

        // 🔹 Create user in Firebase Authentication
        const userRecord = await auth.createUser({
            email: email,
            password: password,
        });

        const uid = userRecord.uid;

        // 🔹 Store username → email mapping
        await usernameRef.set(email);

        // 🔹 Store user details under UID
        await db.ref(`users/${uid}`).set({
            username: username,
            board: "board0",
            body: "body0",
            body_acc: "none",
            bottom: "bottom0",
            costume: "none",
            eyes: "eyes0",
            face_acc: "none",
            gender: "female",
            hair: "hair0",
            hair_acc: "none",
            head: "head0",
            home: "home0",
            outfit: "none",
            shoes: "shoe0",
            top: "top0"
        });

        res.status(201).json({ success: true, message: "User created successfully." });

    } catch (error: any) {
        console.error("❌ SIGNUP ERROR:", error);

        if (error.code === "auth/email-already-exists" || error.message.includes("email-already-in-use")) {
            return res.status(400).json({ success: false, message: "Email is already in use." });
        }
        
        res.status(500).json({ success: false, message: "Error creating user.", error: error.message });
    }
});

interface UsernameParams {
    username: string;
}

router.get("/check-username/:username", async (req: Request<UsernameParams>, res: Response) => {
    const { username } = req.params;

    // ✅ Validate username format
    const usernameRegex = /^[a-z0-9_]{3,14}$/;
    if (!usernameRegex.test(username)) {
        return res.status(400).json({ available: false, message: "Invalid username format." });
    }

    try {
        // 🔹 Check if username exists in the database
        const usernameRef = db.ref(`usernames/${username}`);
        const snapshot = await usernameRef.once("value");

        if (snapshot.exists()) {
            return res.json({ available: false });
        } else {
            return res.json({ available: true });
        }
    } catch (error: any) {
        console.error("❌ USERNAME CHECK ERROR:", error);
        res.status(500).json({ available: false, message: "Error checking username." });
    }
});

export default router;
