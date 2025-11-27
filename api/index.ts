import { registerRoutes } from "../server/routes";
import express from "express";
import cors from "cors";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

// Middleware setup (copied from server/index.ts)
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint - defined BEFORE routes registration
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug endpoint to check configuration (without exposing secrets)
app.get('/api/debug-config', (req, res) => {
  try {
    const fbKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    let parsedKey: any = null;
    let parseError = null;
    
    if (fbKey) {
      try {
        let cleanJson = fbKey;
        if (cleanJson.startsWith('"') && cleanJson.endsWith('"')) {
          cleanJson = JSON.parse(cleanJson);
        }
        parsedKey = JSON.parse(cleanJson);
      } catch (e: any) {
        parseError = e.message;
      }
    }

    res.json({
      env: process.env.NODE_ENV,
      hasFirebaseKey: !!fbKey,
      keyLength: fbKey?.length || 0,
      keyParseError: parseError,
      hasPrivateKey: !!parsedKey?.private_key,
      hasClientEmail: !!parsedKey?.client_email,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize routes lazily
let routesInitialized = false;

export default async function handler(req: any, res: any) {
  try {
    if (!routesInitialized) {
      console.log("Initializing routes...");
      await registerRoutes(httpServer, app);
      routesInitialized = true;
      console.log("Routes initialized successfully");
    }
    
    return app(req, res);
  } catch (error: any) {
    console.error("Top-level server error:", error);
    // Return JSON error instead of crashing to avoid "Unexpected token A"
    res.status(500).json({ 
      message: "Internal Server Error", 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
