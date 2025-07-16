import express, { Request, Response, NextFunction } from 'express';
import databaseService from '../database/prismaService';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

router.use(cookieParser());

// Extended Request interface to include uid
interface AuthenticatedRequest extends Request {
    uid?: string;
}

// ✅ Middleware to Verify JWT
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ success: false, message: "Access Denied" });
    }

    jwt.verify(token, SECRET_KEY, async (err: any, decoded: any) => {
        if (err) {
            return res.status(403).json({ success: false, message: "Invalid Token" });
        }

        req.uid = decoded.uid;
        next();
    });
}

// ✅ Fetch User Data
router.get("/me", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        console.log(`🔍 Fetching user data for UID: ${req.uid}`); // ✅ Debugging

        const user = await databaseService.getUserById(req.uid!);

        if (!user) {
            console.log("❌ User data not found in database.");
            return res.status(404).json({ success: false, message: "User data not found" });
        }

        // Remove password from response
        const { password, ...userData } = user;
        
        // Format data to match expected structure
        const formattedUser = {
            ...userData,
            idfone: { level: userData.idfone_level }
        };

        console.log("✅ User data found:", formattedUser); // ✅ Log user data

        res.json({ success: true, ...formattedUser });

    } catch (error: any) {
        console.error("❌ Database Error:", error);
        res.status(500).json({ success: false });
    }
});


// ✅ Update User Data
router.post("/update", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Handle idfone nested object
        const updateData = { ...req.body };
        if (updateData.idfone && updateData.idfone.level !== undefined) {
            updateData.idfone_level = updateData.idfone.level;
            delete updateData.idfone;
        }

        // Remove fields that shouldn't be updated via this route
        delete updateData.id;
        delete updateData.email;
        delete updateData.password;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        await databaseService.updateUser(req.uid!, updateData);

        res.json({ success: true, message: "User data updated successfully" });

    } catch (error: any) {
        console.error("❌ Error updating user data:", error);
        res.status(500).json({ success: false });
    }
});

export default router;
