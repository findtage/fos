import express, { Request, Response, NextFunction } from 'express';
import { db } from "../firebase/firebaseAdmin";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

router.use(cookieParser());

// Extend Request interface to include uid
declare global {
    namespace Express {
        interface Request {
            uid?: string;
        }
    }
}

// ✅ Middleware to Verify JWT
function authenticateToken(req: Request, res: Response, next: NextFunction): void {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ success: false, message: "Access Denied" });
        return;
    }

    jwt.verify(token, SECRET_KEY, async (err: any, decoded: any) => {
        if (err) {
            res.status(403).json({ success: false, message: "Invalid Token" });
            return;
        }

        req.uid = decoded.uid;
        next();
    });
}

// ✅ Fetch User Data
router.get("/me", authenticateToken, async (req: Request, res: Response) => {
    try {
        console.log(`🔍 Fetching user data for UID: ${req.uid}`); // ✅ Debugging

        const userRef = db.ref(`users/${req.uid}`);
        const snapshot = await userRef.once("value");

        if (!snapshot.exists()) {
            console.log("❌ User data not found in Firebase.");
            return res.status(404).json({ success: false, message: "User data not found" });
        }

        console.log("✅ User data found:", snapshot.val()); // ✅ Log Firebase data

        res.json({ success: true, ...snapshot.val() });

    } catch (error: any) {
        console.error("❌ Firebase Database Error:", error);
        res.status(500).json({ success: false });
    }
});

// ✅ Update User Data
router.post("/update", authenticateToken, async (req: Request, res: Response) => {
    try {
        const userRef = db.ref(`users/${req.uid}`);
        await userRef.update(req.body);

        res.json({ success: true, message: "User data updated successfully" });

    } catch (error: any) {
        console.error("❌ Error updating user data:", error);
        res.status(500).json({ success: false });
    }
});

export default router;
