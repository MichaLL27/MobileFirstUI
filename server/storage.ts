import { adminDb } from "./firebaseAdmin";

export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  workArea?: string | null;
  businessName?: string | null;
  skills: string[];
  backgroundText?: string | null;
  aboutText?: string | null;
  summary?: string | null;
  avatarUrl?: string | null;
  initials: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  userId: string;
  profileStyle: "simple" | "detailed";
  showInPublicSearch: boolean;
  emailOnProfileView: boolean;
  emailProfileTips: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertProfile {
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  workArea?: string | null;
  businessName?: string | null;
  skills?: string[];
  backgroundText?: string | null;
  aboutText?: string | null;
  summary?: string | null;
  avatarUrl?: string | null;
  initials?: string;
  isPublic?: boolean;
}

export interface InsertSettings {
  userId: string;
  profileStyle?: "simple" | "detailed";
  showInPublicSearch?: boolean;
  emailOnProfileView?: boolean;
  emailProfileTips?: boolean;
}

export interface IStorage {
  getProfileByUserId(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile | undefined>;
  deleteProfile(userId: string): Promise<boolean>;
  searchProfiles(query?: string, category?: string): Promise<Profile[]>;
  getPublicProfiles(): Promise<Profile[]>;
  
  getSettings(userId: string): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(userId: string, settings: Partial<InsertSettings>): Promise<Settings | undefined>;
}

export class FirestoreStorage implements IStorage {
  private profilesCollection = adminDb.collection("profiles");
  private settingsCollection = adminDb.collection("settings");

  async getProfileByUserId(userId: string): Promise<Profile | undefined> {
    const doc = await this.profilesCollection.doc(userId).get();
    if (!doc.exists) return undefined;
    const data = doc.data()!;
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Profile;
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const now = new Date();
    const profileData = {
      ...insertProfile,
      skills: insertProfile.skills || [],
      initials: insertProfile.initials || ((insertProfile.firstName?.[0] || "") + (insertProfile.lastName?.[0] || "")).toUpperCase(),
      isPublic: insertProfile.isPublic ?? true,
      createdAt: now,
      updatedAt: now,
    };
    
    await this.profilesCollection.doc(insertProfile.userId).set(profileData);
    
    return {
      id: insertProfile.userId,
      ...profileData,
    } as Profile;
  }

  async updateProfile(userId: string, updateData: Partial<InsertProfile>): Promise<Profile | undefined> {
    const docRef = this.profilesCollection.doc(userId);
    const doc = await docRef.get();
    
    if (!doc.exists) return undefined;
    
    const updatedData = {
      ...updateData,
      updatedAt: new Date(),
    };
    
    await docRef.update(updatedData);
    
    const updatedDoc = await docRef.get();
    const data = updatedDoc.data()!;
    return {
      id: updatedDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Profile;
  }

  async deleteProfile(userId: string): Promise<boolean> {
    const docRef = this.profilesCollection.doc(userId);
    const doc = await docRef.get();
    
    if (!doc.exists) return false;
    
    await docRef.delete();
    return true;
  }

  async searchProfiles(query?: string, category?: string): Promise<Profile[]> {
    let queryRef = this.profilesCollection.where("isPublic", "==", true);
    
    const snapshot = await queryRef.get();
    let profiles = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Profile;
    });

    if (query) {
      const lowerQuery = query.toLowerCase();
      profiles = profiles.filter(p => 
        p.firstName.toLowerCase().includes(lowerQuery) ||
        p.lastName.toLowerCase().includes(lowerQuery) ||
        p.role.toLowerCase().includes(lowerQuery) ||
        (p.businessName && p.businessName.toLowerCase().includes(lowerQuery))
      );
    }

    if (category) {
      const lowerCategory = category.toLowerCase();
      profiles = profiles.filter(p => 
        p.role.toLowerCase().includes(lowerCategory)
      );
    }

    return profiles;
  }

  async getPublicProfiles(): Promise<Profile[]> {
    const snapshot = await this.profilesCollection.where("isPublic", "==", true).get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Profile;
    });
  }

  async getSettings(userId: string): Promise<Settings | undefined> {
    const doc = await this.settingsCollection.doc(userId).get();
    if (!doc.exists) return undefined;
    const data = doc.data()!;
    return {
      userId: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Settings;
  }

  async createSettings(insertSettings: InsertSettings): Promise<Settings> {
    const now = new Date();
    const settingsData = {
      profileStyle: insertSettings.profileStyle || "simple",
      showInPublicSearch: insertSettings.showInPublicSearch ?? true,
      emailOnProfileView: insertSettings.emailOnProfileView ?? true,
      emailProfileTips: insertSettings.emailProfileTips ?? true,
      createdAt: now,
      updatedAt: now,
    };
    
    await this.settingsCollection.doc(insertSettings.userId).set(settingsData);
    
    return {
      userId: insertSettings.userId,
      ...settingsData,
    } as Settings;
  }

  async updateSettings(userId: string, updateData: Partial<InsertSettings>): Promise<Settings | undefined> {
    const docRef = this.settingsCollection.doc(userId);
    const doc = await docRef.get();
    
    if (!doc.exists) return undefined;
    
    const updatedData = {
      ...updateData,
      updatedAt: new Date(),
    };
    
    await docRef.update(updatedData);
    
    const updatedDoc = await docRef.get();
    const data = updatedDoc.data()!;
    return {
      userId: updatedDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Settings;
  }
}

export const storage = new FirestoreStorage();
