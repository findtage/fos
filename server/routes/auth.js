const express = require('express');
const { auth } = require("../firebase/firebaseAdmin.js");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

router.use(cookieParser());

// ✅ Login API - Frontend calls this instead of Firebase directly
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const userRecord = await auth.getUserByEmail(username);

        if (!userRecord) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // ✅ Generate JWT Token
        const token = jwt.sign({ uid: userRecord.uid }, SECRET_KEY, { expiresIn: "1h" });

        // ✅ Set token in an HTTP-only cookie (so the frontend can't see it)
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // Change to true when using HTTPS
            maxAge: 3600000, // 1 hour expiration
        });

        res.json({ success: true });

    } catch (error) {
        //console.error("❌ Firebase Authentication Error:", error);
        res.status(401).json({ success: false, message: "Authentication failed" });
    }
});

module.exports = router;
