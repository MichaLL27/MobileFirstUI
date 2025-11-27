import admin from "firebase-admin";

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

let isConfigured = false;

if (!admin.apps.length) {
  if (serviceAccountJson) {
    try {
      // Handle potential double-stringified JSON or newline issues
      let cleanJson = serviceAccountJson;
      if (cleanJson.startsWith('"') && cleanJson.endsWith('"')) {
        cleanJson = JSON.parse(cleanJson);
      }
      
      const serviceAccount = JSON.parse(cleanJson);
      
      // Fix for Vercel environment where \n might be escaped literally
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin initialized successfully");
      isConfigured = true;
    } catch (error) {
      console.error("Error parsing Firebase service account:", error);
      console.error("Raw key length:", serviceAccountJson.length);
      console.error("First 20 chars:", serviceAccountJson.substring(0, 20));
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
