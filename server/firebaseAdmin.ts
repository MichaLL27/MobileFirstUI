import admin from "firebase-admin";

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

let isConfigured = false;

if (!admin.apps.length) {
  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      isConfigured = true;
    } catch (error) {
      console.error("Error parsing Firebase service account:", error);
    }
  } else {
    console.warn("FIREBASE_SERVICE_ACCOUNT_KEY not set. Firebase Admin features are disabled.");
  }
}

export const isFirebaseAdminConfigured = isConfigured;
export const adminAuth = isConfigured ? admin.auth() : null;
export const adminDb = isConfigured ? admin.firestore() : null;

export async function verifyIdToken(idToken: string) {
  if (!adminAuth) {
    console.warn("Firebase Admin Auth not configured");
    return null;
  }
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return null;
  }
}

export async function getUserFromToken(authHeader: string | undefined) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  
  const idToken = authHeader.split("Bearer ")[1];
  return verifyIdToken(idToken);
}
