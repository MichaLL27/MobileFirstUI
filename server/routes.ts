import type { Express, Request, Response, NextFunction, RequestHandler } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { getUserFromToken } from "./firebaseAdmin";
import { generateProfileWithAI } from "./openai";
import { z } from "zod";

declare global {
  namespace Express {
    interface Request {
      firebaseUser?: {
        uid: string;
        email?: string;
        name?: string;
      };
    }
  }
}

const insertProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string(),
  role: z.string().min(1),
  workArea: z.string().optional().nullable(),
  businessName: z.string().optional().nullable(),
  skills: z.array(z.string()).optional(),
  backgroundText: z.string().optional().nullable(),
  initials: z.string().optional(),
  isPublic: z.boolean().optional(),
});

const updateProfileSchema = insertProfileSchema.partial();

const updateSettingsSchema = z.object({
  profileStyle: z.enum(["simple", "detailed"]).optional(),
  showInPublicSearch: z.boolean().optional(),
  emailOnProfileView: z.boolean().optional(),
  emailProfileTips: z.boolean().optional(),
});

const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    const decodedToken = await getUserFromToken(req.headers.authorization);
    
    if (!decodedToken) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    req.firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
    };
    
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get('/api/auth/user', isAuthenticated, async (req, res) => {
    try {
      res.json({
        uid: req.firebaseUser!.uid,
        email: req.firebaseUser!.email,
        name: req.firebaseUser!.name,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/profiles", async (req, res) => {
    try {
      const { query, category } = req.query;
      const profiles = await storage.searchProfiles(
        query as string | undefined,
        category as string | undefined
      );
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  app.get("/api/profiles/:id", async (req, res) => {
    try {
      const profile = await storage.getProfileByUserId(req.params.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.get("/api/my-profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.firebaseUser!.uid;
      const profile = await storage.getProfileByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching my profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profiles", isAuthenticated, async (req, res) => {
    try {
      const userId = req.firebaseUser!.uid;
      
      const existingProfile = await storage.getProfileByUserId(userId);
      if (existingProfile) {
        return res.status(400).json({ message: "Profile already exists" });
      }

      const profileData = insertProfileSchema.parse(req.body);
      
      const profile = await storage.createProfile({
        ...profileData,
        userId,
      });
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      console.error("Error creating profile:", error);
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.patch("/api/profiles/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.firebaseUser!.uid;
      const profile = await storage.getProfileByUserId(req.params.id);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      if (profile.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updateData = updateProfileSchema.parse(req.body);
      const updatedProfile = await storage.updateProfile(userId, updateData);
      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.delete("/api/profiles/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.firebaseUser!.uid;
      const profile = await storage.getProfileByUserId(req.params.id);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      if (profile.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteProfile(userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting profile:", error);
      res.status(500).json({ message: "Failed to delete profile" });
    }
  });

  app.post("/api/profiles/generate-ai", isAuthenticated, async (req, res) => {
    try {
      const userId = req.firebaseUser!.uid;
      const profile = await storage.getProfileByUserId(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found. Create a profile first." });
      }

      const settings = await storage.getSettings(userId);
      const style = settings?.profileStyle === "detailed" ? "detailed" : "simple";

      const generatedContent = await generateProfileWithAI({
        firstName: profile.firstName,
        lastName: profile.lastName,
        role: profile.role,
        businessName: profile.businessName || undefined,
        workArea: profile.workArea || undefined,
        skills: profile.skills,
        backgroundText: profile.backgroundText || undefined,
      }, style);

      const updatedProfile = await storage.updateProfile(userId, {
        aboutText: generatedContent.aboutText,
        summary: generatedContent.summary,
        skills: generatedContent.skills,
      });

      res.json(updatedProfile);
    } catch (error) {
      console.error("Error generating AI profile:", error);
      res.status(500).json({ message: "Failed to generate AI profile" });
    }
  });

  app.get("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.firebaseUser!.uid;
      let settings = await storage.getSettings(userId);
      
      if (!settings) {
        settings = await storage.createSettings({ userId });
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.firebaseUser!.uid;
      const updateData = updateSettingsSchema.parse(req.body);
      
      let settings = await storage.getSettings(userId);
      if (!settings) {
        settings = await storage.createSettings({ userId, ...updateData });
      } else {
        settings = await storage.updateSettings(userId, updateData);
      }
      
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      }
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  return httpServer;
}
