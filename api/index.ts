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

// Initialize routes lazily
let routesInitialized = false;

export default async function handler(req: any, res: any) {
  if (!routesInitialized) {
    await registerRoutes(httpServer, app);
    routesInitialized = true;
  }
  
  return app(req, res);
}
