import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config();

// Import service account JSON file
const serviceAccountPath = path.join(__dirname, 'firebaseServiceAccount.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    databaseURL: process.env.DB_URL,
});

const db = admin.database();
const auth = admin.auth();

export { db, auth };
