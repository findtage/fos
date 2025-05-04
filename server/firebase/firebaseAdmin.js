const admin = require("firebase-admin");
const dotenv = require("dotenv");
const serviceAccount = require("./firebaseServiceAccount.json"); // Your Firebase private key file

dotenv.config();

// ✅ Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DB_REFERENCE_URL || "", // This should match your Firebase Realtime Database URL
});

const db = admin.database();
const auth = admin.auth();

module.exports = { db, auth };
