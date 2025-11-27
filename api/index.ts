import express from "express";
import cors from "cors";
import { createServer } from "http";

import { registerRoutes } from "./_lib/routes.js";

// NOTE: We do NOT import registerRoutes here statically.
// We import it dynamically inside the handler to prevent top-level crashes
// from taking down the entire function without logs.

const app = express();
const httpServer = createServer(app);

// Middleware setup
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug endpoint
app.get('/api/debug-config', (req, res) => {
  try {
    const fbKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    res.json({
      env: process.env.NODE_ENV,
      hasFirebaseKey: !!fbKey,
      keyLength: fbKey?.length || 0,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

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
    console.error("Critical Server Error:", error);
    // Return JSON error so the user sees it in the browser/console
    res.status(500).json({ 
      message: "Critical Server Error", 
      error: error.message,
      stack: error.stack 
    });
  }
}
