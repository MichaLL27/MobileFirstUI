import { 
  users, profiles, settings,
  type User, type UpsertUser,
  type Profile, type InsertProfile,
  type Settings, type InsertSettings 
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  getProfile(id: string): Promise<Profile | undefined>;
  getProfileByUserId(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: string, profile: Partial<InsertProfile>): Promise<Profile | undefined>;
  deleteProfile(id: string): Promise<boolean>;
  searchProfiles(query?: string, category?: string): Promise<Profile[]>;
  getPublicProfiles(): Promise<Profile[]>;
  
  getSettings(userId: string): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(userId: string, settings: Partial<InsertSettings>): Promise<Settings | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getProfile(id: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile || undefined;
  }

  async getProfileByUserId(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile || undefined;
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const [profile] = await db.insert(profiles).values(insertProfile).returning();
    return profile;
  }

  async updateProfile(id: string, updateData: Partial<InsertProfile>): Promise<Profile | undefined> {
    const [profile] = await db
      .update(profiles)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(profiles.id, id))
      .returning();
    return profile || undefined;
  }

  async deleteProfile(id: string): Promise<boolean> {
    const result = await db.delete(profiles).where(eq(profiles.id, id)).returning();
    return result.length > 0;
  }

  async searchProfiles(query?: string, category?: string): Promise<Profile[]> {
    let conditions: any[] = [eq(profiles.isPublic, true)];
    
    if (query) {
      const searchTerm = `%${query}%`;
      conditions.push(
        or(
          ilike(profiles.firstName, searchTerm),
          ilike(profiles.lastName, searchTerm),
          ilike(profiles.role, searchTerm),
          ilike(profiles.businessName, searchTerm)
        )
      );
    }
    
    if (category) {
      conditions.push(ilike(profiles.role, `%${category}%`));
    }
    
    const result = await db
      .select()
      .from(profiles)
      .where(and(...conditions));
    
    return result;
  }

  async getPublicProfiles(): Promise<Profile[]> {
    return db.select().from(profiles).where(eq(profiles.isPublic, true));
  }

  async getSettings(userId: string): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.userId, userId));
    return setting || undefined;
  }

  async createSettings(insertSettings: InsertSettings): Promise<Settings> {
    const [setting] = await db.insert(settings).values(insertSettings).returning();
    return setting;
  }

  async updateSettings(userId: string, updateData: Partial<InsertSettings>): Promise<Settings | undefined> {
    const [setting] = await db
      .update(settings)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(settings.userId, userId))
      .returning();
    return setting || undefined;
  }
}

export const storage = new DatabaseStorage();
