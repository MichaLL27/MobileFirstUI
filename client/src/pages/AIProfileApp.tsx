import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft, ArrowRight, Share2, UserPlus, Filter, X, ChevronDown, Bell, Edit2, AlertCircle, Wifi, WifiOff, AlertTriangle, Loader, Globe, Shield, BellRing, Info, Trash2, User, Sparkles, Eye, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { OnboardingScreen } from "./OnboardingScreen";

// --- Types ---
type Screen = "home" | "profile" | "join" | "searchResults";

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  summary: string;
  about: string;
  skills: string[];
  avatarUrl?: string;
  initials: string;
}

// --- Loading Spinner Component ---
function LoadingSpinner({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="mb-4"
      >
        <Loader className="h-10 w-10 text-primary" />
      </motion.div>
      <p className="text-sm text-slate-600 text-right">{message}</p>
    </div>
  );
}

// --- Skeleton Loading Component ---
function SkeletonCard() {
  return (
    <div className="bg-slate-100 rounded-xl p-4 space-y-3 animate-pulse">
      <div className="flex gap-4">
        <div className="h-12 w-12 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="h-3 w-32 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
}

// --- Error State Component ---
function ErrorState({ 
  icon: Icon, 
  title, 
  subtitle, 
  onRetry 
}: { 
  icon: React.ReactNode; 
  title: string; 
  subtitle: string; 
  onRetry?: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
        {Icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2 text-right">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 text-right">{subtitle}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
          data-testid="button-retry"
        >
          נסה שוב
        </button>
      )}
    </div>
  );
}

// --- Authentication Screen Component ---
function AuthScreen({ onLogin }: { onLogin: () => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await onLogin();
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-[480px] h-screen bg-linear-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6 text-center"
    >
      {/* Logo / Branding */}
      <div className="space-y-4 w-full mb-12">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">👥</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 text-center">
          התחברות מהירה כדי להתחיל
        </h1>
        <p className="text-base text-slate-600 text-center max-w-xs mx-auto leading-relaxed">
          התחבר כדי ליצור פרופיל עבודה ולהופיע בחיפוש של מעסיקים.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="w-full space-y-4">
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full py-3.5 px-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
          data-testid="button-continue-google"
        >
          {isLoading ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              מתחבר...
            </>
          ) : (
            <>
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              התחבר עם Google
            </>
          )}
        </button>
        <p className="text-xs text-slate-400 text-center">
          בלחיצה על “התחברות”, אתה מאשר את תנאי השימוש שלנו
        </p>
      </div>
    </motion.div>
  );
}

// --- Toast Component ---
function Toast({ 
  message, 
  type = "success" 
}: { 
  message: string; 
  type?: "success" | "error";
}) {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 max-w-[440px] px-4 py-3 rounded-full text-sm font-medium text-white shadow-lg z-40 ${
        type === "success" 
          ? "bg-green-500" 
          : "bg-red-500"
      }`}
      data-testid={`toast-${type}`}
    >
      {message}
    </motion.div>
  );
}

// --- DeleteConfirmationModal Component ---
function DeleteConfirmationModal({ 
  onConfirm, 
  onCancel 
}: { 
  onConfirm: () => void; 
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      data-testid="modal-delete-confirmation"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-xl max-w-xs w-full p-6 space-y-4"
      >
        <h2 className="text-lg font-bold text-slate-900 text-right">למחוק את הפרופיל?</h2>
        <p className="text-sm text-slate-600 text-right leading-relaxed">
          הפעולה לא ניתנת לביטול. אפשר יהיה ליצור פרופיל חדש בכל זמן.
        </p>
        
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            data-testid="button-cancel-delete"
          >
            בטל
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            data-testid="button-confirm-delete"
          >
            מחק פרופיל
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- AppHeader Component ---
function AppHeader({ 
  title, 
  leftIcon, 
  leftAction,
  rightIcon, 
  rightAction,
  transparent = false
}: { 
  title: string; 
  leftIcon?: React.ReactNode; 
  leftAction?: () => void;
  rightIcon?: React.ReactNode; 
  rightAction?: () => void;
  transparent?: boolean;
}) {
  return (
    <div className={`fixed top-0 left-0 right-0 max-w-[480px] mx-auto z-30 transition-all duration-200 ${
      transparent ? 'bg-transparent' : 'bg-white/95 backdrop-blur-sm shadow-sm shadow-slate-200/50'
    }`}>
      <div className="flex items-center justify-between px-6 py-4 h-20">
        {/* Left Icon */}
        <button
          onClick={leftAction}
          className={`h-12 w-12 rounded-2xl flex items-center justify-center hover:bg-slate-50 text-slate-700 transition-all active:scale-95 ${!leftIcon ? 'invisible' : ''}`}
          data-testid="button-header-left"
        >
          {leftIcon}
        </button>

        {/* Title */}
        <h1 className={`text-center font-extrabold text-slate-900 text-xl flex-1 ${transparent ? 'invisible' : ''}`}>
          {title}
        </h1>

        {/* Right Icon */}
        <button
          onClick={rightAction}
          className={`h-12 w-12 rounded-2xl flex items-center justify-center hover:bg-slate-50 text-slate-700 transition-all active:scale-95 ${!rightIcon ? 'invisible' : ''}`}
          data-testid="button-header-right"
        >
          {rightIcon}
        </button>
      </div>
    </div>
  );
}

// --- ProfileAvatar Component ---
function ProfileAvatar({ 
  initials, 
  imageUrl, 
  onChangePhoto,
  size = "md" 
}: { 
  initials: string; 
  imageUrl?: string; 
  onChangePhoto?: (file: File) => void;
  size?: "md" | "lg";
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sizeClasses = size === "lg" ? "w-28 h-28 text-4xl" : "w-24 h-24 text-xl";

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onChangePhoto) {
      onChangePhoto(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt="Profile" 
          className={`${sizeClasses} rounded-full object-cover shrink-0 border-4 border-white shadow-lg`}
        />
      ) : (
        <div className={`${sizeClasses} rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-semibold shrink-0 border-4 border-white shadow-lg`}>
          {initials}
        </div>
      )}
      
      <p className="text-xs text-slate-600 mt-1 text-center">תמונת פרופיל</p>
      
      {onChangePhoto && (
        <>
          <button
            onClick={handleUploadClick}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-1"
            data-testid="button-change-photo"
          >
            {imageUrl ? "שינוי תמונה" : "העלאת תמונה"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            data-testid="input-profile-photo"
          />
        </>
      )}
    </div>
  );
}

// --- Empty State Component ---
function EmptyDirectoryState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
        <Search className="h-12 w-12 text-slate-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2 text-right">אין פרופילים עדיין</h3>
      <p className="text-sm text-slate-500 mb-8 text-right leading-relaxed">
        היה הראשון ליצור פרופיל ולהצטרף לרשימת בעלי המקצוע!
      </p>
      <button
        onClick={onCreateClick}
        className="px-8 py-3 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        data-testid="button-create-first-profile"
      >
        צור פרופיל חדש
      </button>
    </div>
  );
}

function ConfigurationErrorScreen() {
  return (
    <div className="w-full max-w-[480px] h-screen bg-linear-to-b from-red-50 to-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
        <AlertTriangle className="h-10 w-10 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Firebase Not Configured</h1>
      <p className="text-sm text-slate-600 mb-6 leading-relaxed">
        This application requires Firebase credentials to run. Please set up the following environment variables:
      </p>
      <div className="bg-slate-100 rounded-lg p-4 text-left text-xs font-mono text-slate-700 mb-6 w-full">
        <p>VITE_FIREBASE_API_KEY</p>
        <p>VITE_FIREBASE_AUTH_DOMAIN</p>
        <p>VITE_FIREBASE_PROJECT_ID</p>
        <p>VITE_FIREBASE_APP_ID</p>
      </div>
      <p className="text-xs text-slate-500">
        See .env.example for the full list of required environment variables.
      </p>
    </div>
  );
}

export default function AIProfileApp() {
  const { user, isAuthenticated, isLoading: authLoading, login, isConfigured: firebaseConfigured, getIdToken } = useAuth();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<"directory" | "create" | "profile" | "settings">("directory");
  const [activeScreen, setActiveScreen] = useState<Screen>("home");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState<"none" | "noInternet" | "serverError">("none");
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["/api/profiles"],
    queryFn: async () => {
      const res = await fetch("/api/profiles");
      if (!res.ok) throw new Error("Failed to fetch profiles");
      return res.json();
    },
  });

  const { data: myProfile, isLoading: myProfileLoading } = useQuery({
    queryKey: ["/api/my-profile"],
    queryFn: async () => {
      const token = await getIdToken();
      const res = await fetch("/api/my-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      return data;
    },
    enabled: isAuthenticated,
  });

  const hasProfile = !!myProfile;

  const normalizedProfiles: Profile[] = (profiles as any[]).map((p: any) => ({
    id: String(p.id),
    firstName: p.firstName || "",
    lastName: p.lastName || "",
    role: p.role || "",
    summary: p.summary || (p.aboutText ? p.aboutText.slice(0, 100) + (p.aboutText.length > 100 ? "..." : "") : ""),
    about: p.aboutText || p.backgroundText || "",
    skills: p.skills || [],
    avatarUrl: p.avatarUrl || undefined,
    initials: p.initials || ((p.firstName?.[0] || "") + (p.lastName?.[0] || "")).toUpperCase() || "?",
  }));

  const filteredProfiles = normalizedProfiles.filter((p) => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  // Handlers
  const handleProfileClick = (profile: Profile) => {
    setSelectedProfile(profile);
    setActiveScreen("profile");
  };

  const handleBack = () => {
    setActiveScreen("home");
    setSelectedProfile(null);
  };

  const handleJoinClick = () => {
    setActiveScreen("join");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveScreen("searchResults");
  };

  const handleTabChange = (tab: "directory" | "create" | "profile" | "settings") => {
    setActiveTab(tab);
    if (tab === "directory") {
      setActiveScreen("home");
    } else if (tab === "create") {
      setActiveScreen("join");
    }
  };

  if (!firebaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center font-sans text-slate-900">
        <ConfigurationErrorScreen />
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingScreen
        onComplete={() => {
          localStorage.setItem("hasSeenOnboarding", "true");
          setShowOnboarding(false);
        }}
      />
    );
  }

  if (authLoading) {
    return (
      <div dir="rtl" className="min-h-screen bg-slate-50 flex justify-center items-center font-sans text-slate-900">
        <LoadingSpinner message="טוען..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div dir="rtl" className="min-h-screen bg-slate-50 flex justify-center font-sans text-slate-900">
        <AuthScreen onLogin={login} />
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50/50 flex justify-center font-sans text-slate-900">
      {/* Mobile Container */}
      <div className="w-full max-w-[480px] bg-[#F2F7FF] min-h-screen shadow-2xl shadow-slate-200/50 flex flex-col relative overflow-hidden pb-20">
        
        {/* Error Banner */}
        {errorState === "noInternet" && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 max-w-[480px] mx-auto bg-red-50 border-b border-red-200 px-4 py-3 flex items-center gap-2 z-50"
            data-testid="banner-no-internet"
          >
            <WifiOff className="h-5 w-5 text-red-600 shrink-0" />
            <span className="text-sm font-medium text-red-700 text-right flex-1">אין חיבור לאינטרנט</span>
          </motion.div>
        )}
        {errorState === "serverError" && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 max-w-[480px] mx-auto bg-yellow-50 border-b border-yellow-200 px-4 py-3 flex items-center gap-2 z-50"
            data-testid="banner-server-error"
          >
            <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
            <span className="text-sm font-medium text-yellow-700 text-right flex-1">בעיה בטעינה, נסה שוב</span>
          </motion.div>
        )}
        
        <AnimatePresence mode="wait">
          {activeTab === "settings" && (
            <SettingsScreen 
              key="settings" 
              onBack={() => setActiveTab("directory")}
              onDeleteClick={() => setShowDeleteModal(true)}
            />
          )}

          {activeTab === "profile" && (
            <MyProfileScreen 
              key="myProfile"
              profile={myProfile}
              hasProfile={hasProfile}
              onCreateClick={() => setActiveTab("create")}
              onRefresh={() => queryClient.invalidateQueries({ queryKey: ["/api/my-profile"] })}
            />
          )}

          {activeTab === "directory" && activeScreen === "home" && (
            <HomeScreen 
              key="home"
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              profiles={filteredProfiles}
              onProfileClick={handleProfileClick}
              onJoinClick={handleJoinClick}
              onClearFilters={() => setSearchTerm("")}
            />
          )}

          {activeTab === "directory" && activeScreen === "profile" && selectedProfile && (
            <ProfileScreen 
              key="profile"
              profile={selectedProfile}
              onBack={handleBack}
            />
          )}

          {activeTab === "create" && (
            <JoinScreen 
              key="join"
              onBack={handleBack}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/my-profile"] });
                setToast({ message: "הפרופיל נשמר בהצלחה", type: "success" });
                setActiveTab("profile");
              }}
              onError={(msg) => setToast({ message: msg, type: "error" })}
            />
          )}

          {activeTab === "directory" && activeScreen === "searchResults" && (
            <SearchResultsScreen
              key="searchResults"
              searchQuery={searchQuery}
              profiles={filteredProfiles}
              onBack={handleBack}
              onProfileClick={handleProfileClick}
            />
          )}
        </AnimatePresence>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-lg max-w-[480px] mx-auto w-full z-50">
          <div className="flex justify-around items-center h-20">
            {/* Directory Tab */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleTabChange("directory")}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-3 transition-all duration-200 relative ${
                activeTab === "directory"
                  ? "text-primary scale-105"
                  : "text-[#BFC5D2] hover:text-slate-600"
              }`}
              data-testid="tab-directory"
            >
              {activeTab === "directory" && (
                <motion.div layoutId="nav-indicator" className="absolute top-1 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
              <span className="text-2xl">👥</span>
              <span className="text-[10px] font-bold tracking-wide">חיפוש</span>
            </motion.button>

            {/* Create Tab */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleTabChange("create")}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-3 transition-all duration-200 relative ${
                activeTab === "create"
                  ? "text-primary scale-105"
                  : "text-[#BFC5D2] hover:text-slate-600"
              }`}
              data-testid="tab-create"
            >
              {activeTab === "create" && (
                <motion.div layoutId="nav-indicator" className="absolute top-1 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
              <span className="text-2xl">✨</span>
              <span className="text-[10px] font-bold tracking-wide">יצירה</span>
            </motion.button>

            {/* My Profile Tab */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleTabChange("profile")}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-3 transition-all duration-200 relative ${
                activeTab === "profile"
                  ? "text-primary scale-105"
                  : "text-[#BFC5D2] hover:text-slate-600"
              }`}
              data-testid="tab-profile"
            >
              {activeTab === "profile" && (
                <motion.div layoutId="nav-indicator" className="absolute top-1 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
              <span className="text-2xl">👤</span>
              <span className="text-[10px] font-bold tracking-wide">הפרופיל שלי</span>
            </motion.button>

            {/* Settings Tab */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleTabChange("settings")}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-3 transition-all duration-200 relative ${
                activeTab === "settings"
                  ? "text-primary scale-105"
                  : "text-[#BFC5D2] hover:text-slate-600"
              }`}
              data-testid="tab-settings"
            >
              {activeTab === "settings" && (
                <motion.div layoutId="nav-indicator" className="absolute top-1 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
              <span className="text-2xl">⚙️</span>
              <span className="text-[10px] font-bold tracking-wide">הגדרות</span>
            </motion.button>
          </div>
        </div>
        
        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <DeleteConfirmationModal
              onConfirm={async () => {
                if (myProfile?.id) {
                  try {
                    const token = await getIdToken();
                    await fetch(`/api/profiles/${myProfile.id}`, { 
                      method: "DELETE",
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    queryClient.invalidateQueries({ queryKey: ["/api/my-profile"] });
                    setToast({ message: "הפרופיל נמחק בהצלחה", type: "success" });
                  } catch (error) {
                    setToast({ message: "שגיאה במחיקת הפרופיל", type: "error" });
                  }
                }
                setShowDeleteModal(false);
              }}
              onCancel={() => setShowDeleteModal(false)}
            />
          )}
        </AnimatePresence>

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <Toast message={toast.message} type={toast.type} />
          )}
        </AnimatePresence>

        {/* Global Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/10 flex items-center justify-center z-40 max-w-[480px]"
              data-testid="loading-overlay"
            >
              <LoadingSpinner message="יוצר את הפרופיל שלך..." />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Sub-Components ---

function HomeScreen({ 
  searchTerm, 
  setSearchTerm, 
  profiles, 
  onProfileClick, 
  onJoinClick, 
  onClearFilters
}: { 
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  profiles: Profile[];
  onProfileClick: (p: Profile) => void;
  onJoinClick: () => void;
  onClearFilters: () => void;
}) {
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedQuickFilters, setSelectedQuickFilters] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [filterLocation, setFilterLocation] = useState("");
  const [selectedSeniority, setSelectedSeniority] = useState<string | null>(null);
  const [selectedWorkStyle, setSelectedWorkStyle] = useState<string[]>([]);

  const quickFilterCategories = ["חשמלאי", "אינסטלטור", "ניקיון", "שליחויות"];
  const roleOptions = ["חשמלאי", "אינסטלטור", "ניקיון", "נהג / שליח", "בנייה", "טיפול בילדים", "אחר"];
  const seniorityOptions = ["עד שנה", "1–3 שנים", "3–5 שנים", "5+ שנים"];
  const workStyleOptions = ["הגעה לבית הלקוח", "במקום קבוע", "גמיש"];

  const handleToggleQuickFilter = (filter: string) => {
    setSelectedQuickFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const handleToggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleToggleSeniority = (seniority: string) => {
    setSelectedSeniority((prev) => (prev === seniority ? null : seniority));
  };

  const handleToggleWorkStyle = (style: string) => {
    setSelectedWorkStyle((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleClearFilters = () => {
    setSelectedQuickFilters([]);
    setSelectedRoles([]);
    setFilterLocation("");
    setSelectedSeniority(null);
    setSelectedWorkStyle([]);
  };

  const hasActiveFilters =
    selectedQuickFilters.length > 0 ||
    selectedRoles.length > 0 ||
    filterLocation ||
    selectedSeniority ||
    selectedWorkStyle.length > 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full pt-6 p-6 relative bg-[#F2F7FF]"
    >
      {/* Friendly Header */}
      <div className="mb-6 pt-4">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-1 text-right">
          שלום! 👋
        </h1>
        <p className="text-lg text-slate-600 text-right font-medium">
          איזה בעל מקצוע אתם מחפשים היום?
        </p>
      </div>

      {/* Search Bar - Big & Friendly */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
            <Search className="h-6 w-6" />
          </div>
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="חיפוש (לדוגמה: יוסי חשמלאי)"
            className="pl-12 h-14 rounded-2xl border-0 bg-white shadow-sm shadow-slate-200/50 focus-visible:ring-2 focus-visible:ring-primary/20 text-base placeholder:text-slate-400"
            data-testid="input-search"
          />
        </div>
        <button
          onClick={() => setShowFilters(true)}
          className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
            hasActiveFilters
              ? "bg-primary text-white shadow-lg shadow-primary/30"
              : "bg-white text-slate-600 shadow-sm shadow-slate-200/50 hover:bg-slate-50"
          }`}
          data-testid="button-filters"
        >
          <Filter className="h-6 w-6" />
        </button>
      </div>

      {/* Quick Filter Chips - Colorful & Friendly */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
        {quickFilterCategories.map((category, idx) => {
          const colors = [
            "bg-blue-50 text-blue-700 border-blue-100",
            "bg-emerald-50 text-emerald-700 border-emerald-100",
            "bg-amber-50 text-amber-700 border-amber-100",
            "bg-purple-50 text-purple-700 border-purple-100"
          ];
          const activeColor = "bg-primary text-white border-primary shadow-lg shadow-primary/25";
          const colorClass = selectedQuickFilters.includes(category) ? activeColor : colors[idx % colors.length];

          return (
            <button
              key={category}
              onClick={() => handleToggleQuickFilter(category)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${colorClass}`}
              data-testid={`chip-filter-${category}`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Show Empty State if No Profiles */}
      {profiles.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
            <Search className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 text-right">לא מצאנו עדיין...</h3>
          <p className="text-base text-slate-500 mb-8 text-right">
            נסו לחפש משהו אחר או לשנות את הסינון.
          </p>
          <button
            onClick={onClearFilters}
            className="px-8 py-3.5 text-base font-bold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 active:scale-95"
            data-testid="button-clear-filters-empty"
          >
            נקה הכל
          </button>
        </div>
      ) : (
        <>
          {/* Profile List */}
          <div className="flex-1 overflow-y-auto space-y-4 pb-24 -mx-2 px-2">
            {profiles.map((profile) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
                key={profile.id}
                onClick={() => onProfileClick(profile)}
                className="group cursor-pointer bg-white rounded-3xl p-5 shadow-sm shadow-slate-200/50 border border-white hover:border-primary/20 transition-all duration-200"
                data-testid={`card-profile-${profile.id}`}
              >
                <div className="flex items-center gap-5">
                  <Avatar className="h-16 w-16 border-4 border-slate-50 shadow-inner shrink-0">
                    <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-xl">
                      {profile.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-right">
                    <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-primary transition-colors">
                      {profile.firstName} {profile.lastName}
                    </h3>
                    <div className="flex items-center justify-end gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">
                        {profile.role}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed pl-2">
                      {profile.summary}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Filters Bottom Sheet */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
              onClick={() => setShowFilters(false)}
              data-testid="filters-overlay"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white rounded-t-[32px] shadow-2xl z-50 max-h-[92vh] min-h-[60vh] overflow-y-auto pb-8"
              data-testid="filters-bottom-sheet"
            >
              <div className="p-8 pb-12">
                <div className="flex justify-center mb-6">
                  <div className="h-1.5 w-12 rounded-full bg-slate-200" />
                </div>

                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">סינון</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-base font-bold text-slate-900 mb-4 text-right">תחום עבודה</h3>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {roleOptions.map((role) => (
                        <button
                          key={role}
                          onClick={() => handleToggleRole(role)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                            selectedRoles.includes(role)
                              ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <label className="text-base font-bold text-slate-900 mb-4 block text-right">אזור עבודה</label>
                    <Input
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                      placeholder="לדוגמה: תל אביב"
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 text-right"
                    />
                  </section>

                  <section>
                    <h3 className="text-base font-bold text-slate-900 mb-4 text-right">ניסיון</h3>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {seniorityOptions.map((level) => (
                        <button
                          key={level}
                          onClick={() => handleToggleSeniority(level)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                            selectedSeniority === level
                              ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="flex gap-4 mt-10">
                  <button
                    onClick={handleClearFilters}
                    className="flex-1 h-14 rounded-2xl text-base font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                  >
                    נקה הכל
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-[2] h-14 rounded-2xl text-base font-bold bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all"
                  >
                    הראה תוצאות
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}function ProfileScreen({ 
  profile, 
  onBack 
}: { 
  profile: Profile; 
  onBack: () => void; 
}) {
  const [expandedAbout, setExpandedAbout] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full bg-[#F2F7FF] overflow-y-auto relative"
    >
      {/* Header Image / Gradient */}
      <div className="h-40 bg-linear-to-b from-blue-600 to-blue-400 relative">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
          <button 
            onClick={onBack}
            className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all"
          >
            <ArrowRight className="h-6 w-6" />
          </button>
          <button 
            className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="px-6 pb-8 -mt-12 relative z-10">
        {/* Hero Profile Block */}
        <div className="flex flex-col items-center text-center mb-6 bg-white rounded-4xl p-6 shadow-xl shadow-slate-200/50">
          <div className="-mt-16 mb-4 p-1.5 bg-white rounded-full">
            <ProfileAvatar
              initials={profile.initials}
              imageUrl={profile.avatarUrl}
              size="lg"
            />
          </div>
          
          <h2 className="text-2xl font-extrabold text-slate-900 mb-1" data-testid="text-profile-name">
            {profile.firstName} {profile.lastName}
          </h2>
          
          <p className="text-lg text-primary font-bold mb-4">
            {profile.role}
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 text-sm font-medium">
              <span>📍</span>
              <span>חולון, ישראל</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 text-sm font-medium">
              <span>💼</span>
              <span>5 שנות ניסיון</span>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <button className="flex-1 h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2">
              <span className="text-xl">📞</span>
              צור קשר
            </button>
            <button className="h-12 w-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center hover:bg-blue-100 active:scale-95 transition-all">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* About Section */}
        <section className="mb-6">
          <h3 className="text-lg font-bold text-slate-900 mb-3 text-right px-2">
            אודות
          </h3>
          <div className="bg-white rounded-3xl p-6 shadow-sm shadow-slate-200/50">
            <div className={`relative overflow-hidden ${!expandedAbout ? 'max-h-32' : ''}`}>
              <p className="text-base text-slate-600 leading-relaxed text-right whitespace-pre-line">
                {profile.about}
              </p>
              {!expandedAbout && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-white to-transparent pointer-events-none" />
              )}
            </div>
            <button
              onClick={() => setExpandedAbout(!expandedAbout)}
              className="mt-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              data-testid="button-toggle-about"
            >
              {expandedAbout ? "הצג פחות" : "קרא עוד"}
              <ChevronDown className={`h-4 w-4 transition-transform ${expandedAbout ? "rotate-180" : ""}`} />
            </button>
          </div>
        </section>

        {/* Skills Section */}
        <section className="mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-3 text-right px-2">
            תחומי התמחות
          </h3>
          <div className="flex flex-wrap gap-2 justify-end">
            {profile.skills.map((skill) => (
              <span 
                key={skill} 
                className="px-4 py-2 rounded-xl text-sm font-bold bg-white text-slate-700 border border-slate-100 shadow-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}

function JoinScreen({ onBack, onSuccess, onError }: { 
  onBack: () => void; 
  onSuccess?: () => void; 
  onError?: (msg: string) => void;
}) {
  const { getIdToken } = useAuth();
  const [step, setStep] = useState(1);
  const [backgroundNotes, setBackgroundNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [workArea, setWorkArea] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [skills, setSkills] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!fullName.trim() || !role.trim()) {
      onError?.("יש למלא שם מלא ותחום עבודה");
      return;
    }

    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    const initials = (firstName[0] || "") + (lastName[0] || "");

    setIsSubmitting(true);
    try {
      const token = await getIdToken();
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          role,
          workArea: workArea || null,
          businessName: businessName || null,
          skills: skills.split(",").map(s => s.trim()).filter(Boolean),
          backgroundText: backgroundNotes || null,
          initials: initials.toUpperCase() || "UN",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "שגיאה ביצירת הפרופיל");
      }

      setIsGeneratingAI(true);
      const aiRes = await fetch("/api/profiles/generate-ai", { 
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsGeneratingAI(false);

      onSuccess?.();
    } catch (error: any) {
      onError?.(error.message || "שגיאה ביצירת הפרופיל");
    } finally {
      setIsSubmitting(false);
      setIsGeneratingAI(false);
    }
  };

  const handlePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        setPhotoUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Extract initials from name
  const getInitials = () => {
    return fullName
      .trim()
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "UN";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex flex-col h-full bg-[#F2F7FF] relative overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-linear-to-b from-blue-100/50 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 px-6 pt-8 pb-4 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="h-12 w-12 rounded-2xl bg-white shadow-sm shadow-slate-200/50 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
        >
          <ArrowRight className="h-6 w-6" />
        </button>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className={`h-2 rounded-full transition-all duration-500 ${
                i <= step ? "w-8 bg-primary" : "w-2 bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8 relative z-10">
        <div className="mb-8 text-right">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
            {step === 1 && "בואו נכיר! 👋"}
            {step === 2 && "מה אתם עושים? 🛠️"}
            {step === 3 && "קצת על עצמכם ✍️"}
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            {step === 1 && "כמה פרטים בסיסיים כדי שיוכלו לפנות אליכם"}
            {step === 2 && "ספרו לנו במה אתם עוסקים ואיפה"}
            {step === 3 && "כמה מילים שיעזרו לכם לבלוט"}
          </p>
        </div>

        <div className="bg-white rounded-4xl p-6 shadow-xl shadow-slate-200/50 space-y-6">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-center pb-4">
                <ProfileAvatar
                  initials={getInitials()}
                  imageUrl={photoUrl}
                  onChangePhoto={handlePhotoUpload}
                  size="lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-base font-bold text-slate-900 block text-right">שם מלא</label>
                <Input 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white text-lg text-right"
                  placeholder="ישראל ישראלי"
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-base font-bold text-slate-900 block text-right">מקצוע / תפקיד</label>
                <Input 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white text-lg text-right"
                  placeholder="לדוגמה: חשמלאי מוסמך"
                />
              </div>
              <div className="space-y-2">
                <label className="text-base font-bold text-slate-900 block text-right">אזור עבודה</label>
                <Input 
                  value={workArea}
                  onChange={(e) => setWorkArea(e.target.value)}
                  className="h-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white text-lg text-right"
                  placeholder="לדוגמה: גוש דן"
                />
              </div>
              <div className="space-y-2">
                <label className="text-base font-bold text-slate-900 block text-right">שם העסק (אופציונלי)</label>
                <Input 
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="h-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white text-lg text-right"
                  placeholder="לדוגמה: רוני חשמל"
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-base font-bold text-slate-900 block text-right">שירותים עיקריים</label>
                <Input 
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="h-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white text-lg text-right"
                  placeholder="לדוגמה: תיקונים, התקנות..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-base font-bold text-slate-900 block text-right">קצת עליי (אופציונלי)</label>
                <textarea 
                  value={backgroundNotes}
                  onChange={(e) => setBackgroundNotes(e.target.value)}
                  className="w-full h-40 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white text-lg text-right p-4 outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="אני עובד חרוץ, דייקן..."
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="p-6 bg-white border-t border-slate-100 flex gap-3">
        {step > 1 && (
          <button
            onClick={handlePrev}
            disabled={isSubmitting || isGeneratingAI}
            className="h-16 w-16 rounded-2xl bg-slate-100 text-slate-600 text-xl font-bold hover:bg-slate-200 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50"
          >
            <ArrowRight className="h-6 w-6" />
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={isSubmitting || isGeneratingAI}
          className="flex-1 h-16 rounded-2xl bg-primary text-white text-xl font-bold shadow-xl shadow-primary/25 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isSubmitting || isGeneratingAI ? (
            <>
              <Loader className="h-6 w-6 animate-spin" />
              {isGeneratingAI ? "יוצר פרופיל..." : "שומר..."}
            </>
          ) : (
            <>
              {step === 3 ? "סיימתי! 🎉" : "המשך"}
              {step < 3 && <ArrowLeft className="h-6 w-6" />}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

function SearchResultsScreen({
  searchQuery,
  onBack,
  onProfileClick,
  profiles,
}: {
  searchQuery: string;
  onBack: () => void;
  onProfileClick: (profile: Profile) => void;
  profiles: Profile[];
}) {
  const [sortBy, setSortBy] = useState("Relevance");

  // Filter results by search query
  const searchResults = profiles.filter((p) => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full bg-[#F2F7FF] overflow-y-auto pt-20"
    >
      <AppHeader
        title="תוצאות חיפוש"
        leftIcon={<ArrowLeft className="h-5 w-5" />}
        leftAction={onBack}
      />

      <div className="px-6 pb-6 flex-1 flex flex-col pt-2">
        {/* Search Summary */}
        <p className="text-sm font-medium text-slate-500 mb-4 text-right">
          נמצאו {searchResults.length} תוצאות עבור <span className="text-slate-900 font-bold">"{searchQuery}"</span>
        </p>

        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">מיון לפי</span>
            <button
              className="flex items-center gap-1 text-sm text-slate-900 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 font-bold"
              data-testid="button-sort"
            >
              רלוונטיות
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
          </div>
          <button
            onClick={onBack}
            className="text-xs font-bold text-primary bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
            data-testid="button-clear-search"
          >
            נקה חיפוש
          </button>
        </div>

        {/* Results List */}
        {searchResults.length > 0 ? (
          <div className="space-y-4 flex-1">
            {searchResults.map((profile) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={profile.id}
                onClick={() => onProfileClick(profile)}
                className="group cursor-pointer bg-white rounded-3xl p-5 shadow-sm shadow-slate-200/50 border border-white hover:border-primary/20 transition-all duration-200 active:scale-[0.98]"
                data-testid={`card-search-result-${profile.id}`}
              >
                <div className="flex items-center gap-5">
                  <Avatar className="h-14 w-14 border-4 border-slate-50 shadow-inner shrink-0">
                    <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-lg">
                      {profile.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-right">
                    <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-primary transition-colors">
                      {profile.firstName} {profile.lastName}
                    </h3>
                    <div className="flex items-center justify-end gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">
                        {profile.role}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-1 leading-relaxed pl-2">
                      {profile.summary}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
              <Search className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 text-right">לא מצאנו תוצאות</h3>
            <p className="text-base text-slate-500 mb-8 text-right">
              נסו לחפש משהו אחר או לשנות את הסינון.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function MyProfileScreen({
  profile,
  hasProfile,
  onCreateClick,
  onRefresh
}: {
  profile: any;
  hasProfile: boolean;
  onCreateClick: () => void;
  onRefresh?: () => void;
}) {
  const { getIdToken } = useAuth();
  const [expandedAbout, setExpandedAbout] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handleRegenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      const token = await getIdToken();
      await fetch("/api/profiles/generate-ai", { 
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      onRefresh?.();
    } catch (error) {
      console.error("Failed to regenerate AI profile");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full bg-[#F2F7FF] overflow-y-auto relative"
    >
      {!hasProfile ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center mb-8 shadow-xl shadow-slate-200/50">
            <UserPlus className="h-16 w-16 text-primary/40" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 mb-3 text-right">עדיין לא יצרת פרופיל</h3>
          <p className="text-lg text-slate-600 mb-10 text-right leading-relaxed max-w-xs mx-auto">
            כדי שיוכלו למצוא אותך, צור פרופיל מקצועי קצר. זה לוקח דקה!
          </p>
          <button
            onClick={onCreateClick}
            className="w-full max-w-xs h-14 text-lg font-bold text-white bg-primary rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 active:scale-95 flex items-center justify-center gap-2"
            data-testid="button-create-profile-empty"
          >
            <span className="text-xl">✨</span>
            צור פרופיל
          </button>
        </div>
      ) : (
        <>
          {/* Header Image / Gradient */}
          <div className="h-40 bg-linear-to-b from-blue-600 to-blue-400 relative">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
              <h1 className="text-white font-bold text-lg drop-shadow-md">הפרופיל שלי</h1>
              <button 
                className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all"
              >
                <Edit2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="px-6 pb-24 -mt-12 relative z-10">
            {/* Hero Profile Block */}
            <div className="flex flex-col items-center text-center mb-6 bg-white rounded-4xl p-6 shadow-xl shadow-slate-200/50">
              <div className="-mt-16 mb-4 p-1.5 bg-white rounded-full">
                <Avatar className="h-28 w-28 shadow-inner border-4 border-slate-50">
                  {profile?.avatarUrl ? (
                    <AvatarImage src={profile.avatarUrl} />
                  ) : null}
                  <AvatarFallback className="bg-blue-50 text-blue-600 text-3xl font-bold tracking-tight">
                    {profile?.initials || "?"}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
                {profile?.firstName} {profile?.lastName}
              </h2>
              
              <p className="text-lg text-primary font-bold mb-4">
                {profile?.role}
              </p>

              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {profile?.workArea && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 text-sm font-medium">
                    <span>📍</span>
                    <span>{profile.workArea}</span>
                  </div>
                )}
                {profile?.businessName && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 text-sm font-medium">
                    <span>💼</span>
                    <span>{profile.businessName}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 w-full">
                <button className="flex-1 h-12 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 active:scale-95 transition-all">
                  עריכה
                </button>
                <button className="flex-1 h-12 rounded-xl bg-blue-50 text-primary font-bold hover:bg-blue-100 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <Share2 className="h-5 w-5" />
                  שיתוף
                </button>
              </div>
            </div>

            {/* About Section */}
            <section className="mb-6">
              <div className="flex items-center justify-between mb-3 px-2">
                <h3 className="text-lg font-bold text-slate-900 text-right">
                  אודות
                </h3>
                {profile?.aboutText && (
                  <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-xs font-bold px-2 py-0.5">
                    ✨ AI Generated
                  </Badge>
                )}
              </div>
              
              <div className="bg-white rounded-3xl p-6 shadow-sm shadow-slate-200/50">
                <div className={`relative overflow-hidden ${!expandedAbout ? 'max-h-32' : ''}`}>
                  <p className="text-base text-slate-600 leading-relaxed text-right whitespace-pre-line">
                    {profile?.aboutText || profile?.backgroundText || "לא נוסף תיאור עדיין"}
                  </p>
                  {!expandedAbout && profile?.aboutText && profile.aboutText.length > 150 && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-white to-transparent pointer-events-none" />
                  )}
                </div>
                {profile?.aboutText && profile.aboutText.length > 150 && (
                  <button
                    onClick={() => setExpandedAbout(!expandedAbout)}
                    className="mt-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  >
                    {expandedAbout ? "הצג פחות" : "קרא עוד"}
                    <ChevronDown className={`h-4 w-4 transition-transform ${expandedAbout ? "rotate-180" : ""}`} />
                  </button>
                )}
              </div>
            </section>

            {/* Skills Section */}
            <section className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 mb-3 text-right px-2">
                תחומי התמחות
              </h3>
              <div className="flex flex-wrap gap-2 justify-end">
                {(profile?.skills || []).map((skill: string) => (
                  <span 
                    key={skill} 
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-white text-slate-700 border border-slate-100 shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </motion.div>
  );
}

function SettingsScreen({ onBack, onDeleteClick }: { onBack: () => void; onDeleteClick: () => void; }) {
  // State management
  const [selectedLanguage, setSelectedLanguage] = useState<"english" | "hebrew">("english");
  const [selectedStyle, setSelectedStyle] = useState<"professional" | "friendly">("professional");
  const [isPublic, setIsPublic] = useState(true);
  const [emailViews, setEmailViews] = useState(false);
  const [emailTips, setEmailTips] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full bg-[#F2F7FF] overflow-y-auto pt-20"
    >
      <AppHeader
        title="הגדרות"
        leftIcon={<ArrowLeft className="h-5 w-5" />}
        leftAction={onBack}
      />

      <div className="px-6 py-6 flex-1 flex flex-col pb-24 pt-2 space-y-8">
        
        {/* Section 1: Account */}
        <section>
          <div className="flex items-center gap-2 mb-3 px-2 justify-end">
            <h3 className="text-sm font-bold text-slate-900">חשבון</h3>
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="bg-white rounded-3xl border border-white px-6 py-5 space-y-4 shadow-sm shadow-slate-200/50">
            <div className="flex items-center justify-between">
              <p className="text-base text-slate-800 font-bold text-right">מצב פרופיל</p>
              <button 
                className="text-sm font-bold text-primary bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors"
                data-testid="button-create-profile"
              >
                צור פרופיל
              </button>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-600 text-right font-medium">אין לך עדיין פרופיל</p>
              <p className="text-xs text-slate-500 pt-1 text-right">נהל את הפרופיל והפרטים של החשבון שלך.</p>
            </div>
          </div>
        </section>

        {/* Section 2: Profile & AI */}
        <section>
          <div className="flex items-center gap-2 mb-3 px-2 justify-end">
            <h3 className="text-sm font-bold text-slate-900">פרופיל ו-AI</h3>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="bg-white rounded-3xl border border-white p-6 space-y-6 shadow-sm shadow-slate-200/50">
            
            {/* Language Selection */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-slate-400" />
                <label className="text-base font-bold text-slate-900 text-right">שפת הפרופיל</label>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedLanguage("english")}
                  className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${
                    selectedLanguage === "english"
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                  data-testid="button-language-english"
                >
                  אנגלית
                </button>
                <button 
                  onClick={() => setSelectedLanguage("hebrew")}
                  className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${
                    selectedLanguage === "hebrew"
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                  data-testid="button-language-hebrew"
                >
                  עברית
                </button>
              </div>
            </div>

            {/* Writing Style */}
            <div className="pb-4 border-b border-slate-100">
              <div className="flex items-center justify-end gap-2 mb-3">
                <label className="text-base font-bold text-slate-900 block text-right">סגנון הפרופיל</label>
                <Edit2 className="h-4 w-4 text-slate-400" />
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                <button
                  onClick={() => setSelectedStyle("professional")}
                  className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-colors ${
                    selectedStyle === "professional"
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                  data-testid="button-style-simple"
                >
                  פשוט
                </button>
                <button
                  onClick={() => setSelectedStyle("friendly")}
                  className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-colors ${
                    selectedStyle === "friendly"
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                  data-testid="button-style-detailed"
                >
                  מפורט יותר
                </button>
              </div>
            </div>

            {/* Regenerate Button */}
            <button 
              className="w-full px-4 py-4 text-sm font-bold text-primary bg-blue-50 border border-blue-100 rounded-2xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
              data-testid="button-regenerate-profile"
            >
              <span className="text-lg">✨</span>
              צור מחדש את הפרופיל שלי בעזרת AI
            </button>
          </div>
        </section>

        {/* Section 3: Privacy */}
        <section>
          <div className="flex items-center gap-2 mb-3 px-2 justify-end">
            <h3 className="text-sm font-bold text-slate-900">פרטיות ותצוגה</h3>
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div className="bg-white rounded-3xl border border-white p-6 space-y-4 shadow-sm shadow-slate-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-slate-400" />
                <label className="text-base font-bold text-slate-900 text-right">הצג בחיפוש הציבורי</label>
              </div>
              <Switch 
                checked={isPublic}
                onCheckedChange={setIsPublic}
                data-testid="toggle-public-profile"
              />
            </div>
            <p className="text-sm text-slate-500 text-right bg-slate-50 p-3 rounded-xl leading-relaxed">
              כשזה כבוי, הפרופיל שלך לא יופיע בתוצאות חיפוש, אבל עדיין תוכל לשתף אותו באופן ישיר.
            </p>
          </div>
        </section>

        {/* Section 4: Notifications */}
        <section>
          <div className="flex items-center gap-2 mb-3 px-2 justify-end">
            <h3 className="text-sm font-bold text-slate-900">התראות</h3>
            <BellRing className="h-4 w-4 text-primary" />
          </div>
          <div className="bg-white rounded-3xl border border-white p-6 space-y-6 shadow-sm shadow-slate-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <label className="text-base font-bold text-slate-900 text-right">התראות במייל</label>
              </div>
              <Switch 
                checked={emailViews}
                onCheckedChange={setEmailViews}
                data-testid="toggle-email-views"
              />
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-slate-400" />
                <label className="text-base font-bold text-slate-900 text-right">טיפים לשיפור הפרופיל</label>
              </div>
              <Switch 
                checked={emailTips}
                onCheckedChange={setEmailTips}
                data-testid="toggle-email-tips"
              />
            </div>
          </div>
        </section>

        {/* Section 5: About the app */}
        <section>
          <div className="bg-slate-50 rounded-3xl border border-slate-100 p-6 space-y-3 text-center">
            <div className="flex justify-center mb-2">
              <Info className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-base font-bold text-slate-900">על האפליקציה</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              האפליקציה עוזרת לעובדים במקצועות יומיומיים ליצור פרופיל פשוט וברור, כדי שלקוחות יוכלו למצוא אותם בקלות.
            </p>
            <p className="text-xs text-slate-400 mt-2">גרסה 0.1.0</p>
            <button 
              className="text-sm font-bold text-primary hover:text-primary/80 transition-colors mt-2"
              data-testid="button-send-feedback"
            >
              שלח משוב
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="pt-4 pb-8 text-center">
          <button 
            onClick={onDeleteClick}
            className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors bg-red-50 px-8 py-4 rounded-2xl w-full flex items-center justify-center gap-2"
            data-testid="button-delete-profile"
          >
            <Trash2 className="h-4 w-4" />
            מחק את הפרופיל שלי
          </button>
        </section>

      </div>
    </motion.div>
  );
}
