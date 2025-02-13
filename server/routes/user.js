const express = require('express');
const { db } = require("../firebase/firebaseAdmin.js");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

router.use(cookieParser());

// ✅ Middleware to Verify JWT
function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ success: false, message: "Access Denied" });
    }

    jwt.verify(token, SECRET_KEY, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, message: "Invalid Token" });
        }

        req.uid = decoded.uid;
        next();
    });
}

// ✅ Fetch User Data
router.get("/me", authenticateToken, async (req, res) => {
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

    } catch (error) {
        console.error("❌ Firebase Database Error:", error);
        res.status(500).json({ success: false });
    }
});


// ✅ Update User Data
router.post("/update", authenticateToken, async (req, res) => {
    try {
        const userRef = db.ref(`users/${req.uid}`);
        await userRef.update(req.body);

        console.log(`✅ User ${req.uid} outfit updated:`, req.body);
        res.json({ success: true, message: "User data updated successfully" });

    } catch (error) {
        console.error("❌ Error updating user data:", error);
        res.status(500).json({ success: false });
    }
});

module.exports = router;
