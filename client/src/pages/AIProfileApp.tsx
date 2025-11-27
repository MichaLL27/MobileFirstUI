import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft, Share2, UserPlus, CheckCircle2, Filter, X, ChevronDown, Bell, Edit2, AlertCircle, Wifi, WifiOff, AlertTriangle, Loader } from "lucide-react";
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
function AuthScreen() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-[480px] h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6 text-center pt-12"
    >
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        {/* Logo / Branding */}
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <span className="text-4xl">👥</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 text-right">פרופילים לעבודה</h1>
          <p className="text-sm text-slate-600 text-right">
            מצא עובדים מוכשרים או הציג את הפרופיל שלך
          </p>
        </div>

        {/* Features List */}
        <div className="space-y-3 w-full">
          <div className="flex gap-3 items-start text-right">
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-slate-700">חיפוש קל של עובדים בכל תחום</span>
          </div>
          <div className="flex gap-3 items-start text-right">
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-slate-700">יצירת פרופיל בדקות ספורות</span>
          </div>
          <div className="flex gap-3 items-start text-right">
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-slate-700">AI עוזר בכתיבת הפרופיל שלך</span>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="w-full space-y-3 pb-8">
        <button
          onClick={handleLogin}
          className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          data-testid="button-continue-google"
        >
          התחבר כדי להתחיל
        </button>
        <p className="text-xs text-slate-500 text-right pt-2">
          בהמשך, אתה מסכים לתנאי השימוש שלנו
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
  rightAction 
}: { 
  title: string; 
  leftIcon?: React.ReactNode; 
  leftAction?: () => void;
  rightIcon?: React.ReactNode; 
  rightAction?: () => void;
}) {
  return (
    <div className="fixed top-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-b border-slate-100 shadow-sm z-30">
      <div className="flex items-center justify-between px-4 py-4 h-16">
        {/* Left Icon */}
        <button
          onClick={leftAction}
          className={`p-2 -ml-2 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors ${!leftIcon ? 'invisible' : ''}`}
          data-testid="button-header-left"
        >
          {leftIcon}
        </button>

        {/* Title */}
        <h1 className="text-center font-semibold text-slate-900 text-lg flex-1">
          {title}
        </h1>

        {/* Right Icon */}
        <button
          onClick={rightAction}
          className={`p-2 -mr-2 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors ${!rightIcon ? 'invisible' : ''}`}
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
          className={`${sizeClasses} rounded-full object-cover shadow-md flex-shrink-0 border-4 border-white shadow-lg`}
        />
      ) : (
        <div className={`${sizeClasses} rounded-full bg-slate-200 text-slate-600 shadow-md flex items-center justify-center font-semibold flex-shrink-0 border-4 border-white shadow-lg`}>
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

export default function AIProfileApp() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
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
      const res = await fetch("/api/my-profile");
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
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
        <AuthScreen />
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50/50 flex justify-center font-sans text-slate-900">
      {/* Mobile Container */}
      <div className="w-full max-w-[480px] bg-white min-h-screen shadow-2xl shadow-slate-200/50 flex flex-col relative overflow-hidden pb-20">
        
        {/* Error Banner */}
        {errorState === "noInternet" && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 max-w-[480px] mx-auto bg-red-50 border-b border-red-200 px-4 py-3 flex items-center gap-2 z-50"
            data-testid="banner-no-internet"
          >
            <WifiOff className="h-5 w-5 text-red-600 flex-shrink-0" />
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
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-lg max-w-[480px] mx-auto w-full">
          <div className="flex justify-around items-center h-20">
            {/* Directory Tab */}
            <button
              onClick={() => handleTabChange("directory")}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-3 transition-colors relative ${
                activeTab === "directory"
                  ? "text-primary"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              data-testid="tab-directory"
            >
              {activeTab === "directory" && (
                <div className="absolute top-1 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
              <span className="text-lg">👥</span>
              <span className="text-[11px] font-medium">חיפוש</span>
            </button>

            {/* Create Tab */}
            <button
              onClick={() => handleTabChange("create")}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-3 transition-colors relative ${
                activeTab === "create"
                  ? "text-primary"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              data-testid="tab-create"
            >
              {activeTab === "create" && (
                <div className="absolute top-1 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
              <span className="text-lg">✨</span>
              <span className="text-[11px] font-medium">יצירה</span>
            </button>

            {/* My Profile Tab */}
            <button
              onClick={() => handleTabChange("profile")}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-3 transition-colors relative ${
                activeTab === "profile"
                  ? "text-primary"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              data-testid="tab-profile"
            >
              {activeTab === "profile" && (
                <div className="absolute top-1 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
              <span className="text-lg">👤</span>
              <span className="text-[11px] font-medium">הפרופיל שלי</span>
            </button>

            {/* Settings Tab */}
            <button
              onClick={() => handleTabChange("settings")}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-3 transition-colors relative ${
                activeTab === "settings"
                  ? "text-primary"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              data-testid="tab-settings"
            >
              {activeTab === "settings" && (
                <div className="absolute top-1 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
              <span className="text-lg">⚙️</span>
              <span className="text-[11px] font-medium">הגדרות</span>
            </button>
          </div>
        </div>
        
        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <DeleteConfirmationModal
              onConfirm={async () => {
                if (myProfile?.id) {
                  try {
                    await fetch(`/api/profiles/${myProfile.id}`, { method: "DELETE" });
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full pt-20 p-6 relative"
    >
      <AppHeader
        title="פרופילים לעבודה"
        leftIcon={<Bell className="h-5 w-5" />}
        leftAction={() => {}}
        rightIcon={<Filter className="h-5 w-5" />}
        rightAction={() => setShowFilters(true)}
      />

      {/* Search + Filters Row */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
            <Search className="h-5 w-5" />
          </div>
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="חיפוש עובד לפי שם מלא"
            className="pl-10 h-12 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary text-sm"
            data-testid="input-search"
          />
        </div>
        <button
          onClick={() => setShowFilters(true)}
          className={`p-3 rounded-full border transition-all h-12 w-12 flex items-center justify-center ${
            hasActiveFilters
              ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
          }`}
          data-testid="button-filters"
        >
          <Filter className="h-5 w-5" />
        </button>
      </div>

      {/* Show Empty State if No Profiles */}
      {profiles.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <Search className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 text-right">לא נמצאו בעלי מקצוע</h3>
          <p className="text-sm text-slate-500 mb-6 text-right">
            נסה לשנות את החיפוש או להסיר חלק מהסינונים.
          </p>
          <button
            onClick={onClearFilters}
            className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
            data-testid="button-clear-filters-empty"
          >
            נקה סינונים
          </button>
        </div>
      ) : (
        <>
      {/* Quick Filter Chips */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {quickFilterCategories.map((category) => (
          <button
            key={category}
            onClick={() => handleToggleQuickFilter(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              selectedQuickFilters.includes(category)
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
            data-testid={`chip-filter-${category}`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Profile List */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-8 -mx-2 px-2">
        {profiles.map((profile) => (
          <div 
            key={profile.id}
            onClick={() => onProfileClick(profile)}
            className="group cursor-pointer bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/10 transition-all duration-200 active:scale-[0.98]"
            data-testid={`card-profile-${profile.id}`}
          >
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                <AvatarFallback className="bg-slate-100 text-slate-600 font-semibold text-lg">
                  {profile.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-primary transition-colors">
                    {profile.firstName} {profile.lastName}
                  </h3>
                </div>
                <p className="text-sm font-medium text-slate-500 mb-1">
                  {profile.role}
                </p>
                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {profile.summary}
                </p>
              </div>
            </div>
          </div>
        ))}

        {profiles.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p>No profiles found matching "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* Filters Bottom Sheet */}
      <AnimatePresence>
        {showFilters && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setShowFilters(false)}
              data-testid="filters-overlay"
            />
            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white rounded-t-3xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto"
              data-testid="filters-bottom-sheet"
            >
              <div className="p-6">
                {/* Handle Bar */}
                <div className="flex justify-center mb-4">
                  <div className="h-1 w-10 rounded-full bg-slate-200" />
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowFilters(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-600"
                  data-testid="button-close-filters"
                >
                  <X className="h-5 w-5" />
                </button>

                <h2 className="text-lg font-bold text-slate-900 mb-6 pr-8">Filters</h2>

                {/* Role Filter */}
                <section className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 text-right">תחום עבודה</h3>
                  <div className="flex flex-wrap gap-2">
                    {roleOptions.map((role) => (
                      <button
                        key={role}
                        onClick={() => handleToggleRole(role)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedRoles.includes(role)
                            ? "bg-primary text-white"
                            : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-50"
                        }`}
                        data-testid={`filter-role-${role}`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Location Filter */}
                <section className="mb-6">
                  <label className="text-sm font-semibold text-slate-900 mb-2 block text-right">אזור עבודה</label>
                  <Input
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    placeholder="לדוגמה: תל אביב, חיפה, דרום הארץ"
                    className="h-10 rounded-lg border-slate-200 bg-slate-50 text-sm"
                    data-testid="filter-location"
                  />
                </section>

                {/* Seniority Filter */}
                <section className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 text-right">ניסיון</h3>
                  <div className="flex flex-wrap gap-2">
                    {seniorityOptions.map((level) => (
                      <button
                        key={level}
                        onClick={() => handleToggleSeniority(level)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedSeniority === level
                            ? "bg-primary text-white"
                            : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-50"
                        }`}
                        data-testid={`filter-seniority-${level}`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Work Style Filter */}
                <section className="mb-8">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 text-right">אופן עבודה</h3>
                  <div className="flex flex-wrap gap-2">
                    {workStyleOptions.map((style) => (
                      <button
                        key={style}
                        onClick={() => handleToggleWorkStyle(style)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedWorkStyle.includes(style)
                            ? "bg-primary text-white"
                            : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-50"
                        }`}
                        data-testid={`filter-workstyle-${style}`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Bottom Actions */}
                <div className="flex gap-3 sticky bottom-0 bg-white pt-4 border-t border-slate-100">
                  <button
                    onClick={handleClearFilters}
                    className="flex-1 px-4 py-3 rounded-lg text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all"
                    data-testid="button-clear-filters"
                  >
                    נקה הכל
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 px-4 py-3 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
                    data-testid="button-apply-filters"
                  >
                    החלת סינון
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}

function ProfileScreen({ 
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
      className="flex flex-col h-full bg-white overflow-y-auto"
    >
      <AppHeader
        title="פרופיל"
        leftIcon={<ArrowLeft className="h-5 w-5" />}
        leftAction={onBack}
        rightIcon={<Share2 className="h-5 w-5" />}
        rightAction={() => {}}
      />

      <div className="px-6 pb-8 pt-24">
        {/* Hero Profile Block */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-5">
            <ProfileAvatar
              initials={profile.initials}
              imageUrl={profile.avatarUrl}
              size="lg"
            />
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-slate-900" data-testid="text-profile-name">
              {profile.firstName} {profile.lastName}
            </h2>
          </div>
          
          <Badge className="mb-3 bg-blue-50 text-blue-700 border-blue-200 text-xs font-medium">
            ✨ Profile written with AI
          </Badge>
          
          <p className="text-base text-primary font-medium mb-4">
            {profile.role}
          </p>

          {/* Metadata Lines */}
          <div className="flex flex-col items-center gap-1.5 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <span>📍</span>
              <span>חולון, ישראל</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>💼</span>
              <span>רוני שירותי חשמל</span>
            </div>
          </div>
        </div>

        {/* About Section */}
        <section className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#69707A] mb-4 text-right">
            עליי
          </h3>
          <div className={`relative rounded-xl border border-slate-100 bg-[#F9FBFF] p-5 overflow-hidden ${!expandedAbout ? 'max-h-40' : ''}`}>
            <div className="space-y-3">
              {profile.about.split('\n').map((paragraph, idx) => (
                <p key={idx} className="text-sm text-slate-700 leading-relaxed text-right">
                  {paragraph}
                </p>
              ))}
            </div>
            {!expandedAbout && (
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#F9FBFF] to-transparent pointer-events-none" />
            )}
          </div>
          <button
            onClick={() => setExpandedAbout(!expandedAbout)}
            className="mt-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            data-testid="button-toggle-about"
          >
            {expandedAbout ? "הצג פחות" : "קרא עוד"}
          </button>
        </section>

        {/* Skills Section */}
        <section className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#69707A] mb-4 text-right">
            שירותים עיקריים
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span 
                key={skill} 
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="mt-auto pt-6 space-y-3">
          <Button 
            className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            data-testid="button-share-profile"
          >
            שיתוף פרופיל
          </Button>
          <button
            className="w-full h-10 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all"
            data-testid="button-edit-profile"
          >
            עריכת פרופיל
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function JoinScreen({ onBack, onSuccess, onError }: { 
  onBack: () => void; 
  onSuccess?: () => void; 
  onError?: (msg: string) => void;
}) {
  const [backgroundNotes, setBackgroundNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [workArea, setWorkArea] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [skills, setSkills] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

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
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      const aiRes = await fetch("/api/profiles/generate-ai", { method: "POST" });
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
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full bg-white overflow-y-auto pt-20"
    >
      <AppHeader
        title="יצירת פרופיל"
        leftIcon={<ArrowLeft className="h-5 w-5" />}
        leftAction={onBack}
      />

      <div className="px-6 py-8 flex-1 flex flex-col">
        <form className="space-y-6 flex-1 flex flex-col" onSubmit={(e) => e.preventDefault()}>
          {/* Profile Picture Section - At Top */}
          <div className="flex justify-center pt-4 pb-2">
            <ProfileAvatar
              initials={getInitials()}
              imageUrl={photoUrl}
              onChangePhoto={handlePhotoUpload}
              size="md"
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 text-right block">שם מלא</label>
              <Input 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="לדוגמה: רוני לוי" 
                className="h-12 rounded-xl border-slate-200 focus:border-primary bg-slate-50"
                data-testid="input-join-name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 text-right block">תחום עבודה / תפקיד</label>
              <Input 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="לדוגמה: חשמלאי, אינסטלטור, עוזרת בית" 
                className="h-12 rounded-xl border-slate-200 focus:border-primary bg-slate-50"
                data-testid="input-join-role"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 text-right block">אזור עבודה <span className="text-slate-400 font-normal">(לא חובה)</span></label>
                <Input 
                  value={workArea}
                  onChange={(e) => setWorkArea(e.target.value)}
                  placeholder="לדוגמה: אזור תל אביב" 
                  className="h-12 rounded-xl border-slate-200 focus:border-primary bg-slate-50"
                  data-testid="input-join-location"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 text-right block">שם העסק <span className="text-slate-400 font-normal">(לא חובה)</span></label>
                <Input 
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="לדוגמה: רוני חשמל בע״מ" 
                  className="h-12 rounded-xl border-slate-200 focus:border-primary bg-slate-50"
                  data-testid="input-join-company"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 text-right block">שירותים / כישורים</label>
              <Input 
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="לדוגמה: תיקוני חשמל לבית, התקנת מזגנים, טיפול בתקלות חירום" 
                className="h-12 rounded-xl border-slate-200 focus:border-primary bg-slate-50"
                data-testid="input-join-skills"
              />
            </div>

            {/* Background Notes */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600 text-right block">רקע עליך (לא חובה)</label>
              <textarea
                value={backgroundNotes}
                onChange={(e) => setBackgroundNotes(e.target.value)}
                placeholder="כתוב כמה משפטים או נקודות על הניסיון שלך, סוגי עבודות שאתה עושה, והאזור שבו אתה עובד. הבינה המלאכותית תהפוך את זה לתיאור מסודר בפרופיל שלך."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none min-h-24"
                data-testid="textarea-join-background"
              />
              <p className="text-xs text-slate-500 text-right">
                כל מה שתכתוב כאן ישמש את הבינה המלאכותית לכתוב עבורך את אזור 'עליי' בצורה פשוטה וברורה.
              </p>
            </div>
          </div>

          {/* AI Preview Card */}
          <div className="mt-6 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#69707A] mb-3 text-right">
              תצוגת פרופיל שנוצרה בעזרת AI
            </h3>
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
               {/* Skeleton UI */}
               <div className="flex items-center gap-4 mb-4">
                 <div className="h-12 w-12 rounded-full bg-slate-200/70 animate-pulse" />
                 <div className="space-y-2">
                   <div className="h-4 w-32 bg-slate-200/70 rounded animate-pulse" />
                   <div className="h-3 w-24 bg-slate-200/50 rounded animate-pulse" />
                 </div>
               </div>
               <div className="space-y-2 mb-4">
                 <div className="h-3 w-full bg-slate-200/50 rounded animate-pulse" />
                 <div className="h-3 w-[90%] bg-slate-200/50 rounded animate-pulse" />
                 <div className="h-3 w-[80%] bg-slate-200/50 rounded animate-pulse" />
               </div>
               <div className="flex gap-2">
                 <div className="h-6 w-16 bg-slate-200/60 rounded-lg animate-pulse" />
                 <div className="h-6 w-20 bg-slate-200/60 rounded-lg animate-pulse" />
               </div>
               
               {/* Overlay Badge */}
               <div className="absolute top-3 right-3">
                 <Badge variant="secondary" className="bg-white/80 backdrop-blur text-slate-500 text-[10px] border-slate-100">
                   AI Preview
                 </Badge>
               </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="pt-4 mt-auto space-y-3">
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || isGeneratingAI}
              className="w-full h-14 text-lg font-semibold rounded-xl shadow-xl shadow-primary/25 hover:shadow-primary/35 transition-all active:scale-[0.99] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none disabled:opacity-50"
              type="button"
              data-testid="button-generate-profile"
            >
              {isSubmitting || isGeneratingAI ? (
                <span className="flex items-center gap-2">
                  <Loader className="h-5 w-5 animate-spin" />
                  {isGeneratingAI ? "יוצר פרופיל עם AI..." : "שומר..."}
                </span>
              ) : (
                <>
                  <span className="mr-2 text-xl">✨</span>
                  צור לי פרופיל בעזרת AI
                </>
              )}
            </Button>
            <p className="text-center text-xs text-slate-400">
              המערכת תיצור עבורך תיאור מקצועי ברור לפי מה שמילאת בטופס.
            </p>
          </div>
        </form>
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
      className="flex flex-col h-full bg-white overflow-y-auto pt-20"
    >
      <AppHeader
        title="תוצאות חיפוש"
        leftIcon={<ArrowLeft className="h-5 w-5" />}
        leftAction={onBack}
      />

      <div className="px-6 pb-6 flex-1 flex flex-col pt-2">
        {/* Search Summary */}
        <p className="text-xs text-slate-500 mb-4">
          Showing {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for '{searchQuery}'
        </p>

        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Sort by</span>
            <button
              className="flex items-center gap-1 text-sm text-slate-700 hover:text-slate-900 transition-colors"
              data-testid="button-sort"
            >
              {sortBy}
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={onBack}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            data-testid="button-clear-search"
          >
            Clear search
          </button>
        </div>

        {/* Results List */}
        {searchResults.length > 0 ? (
          <div className="space-y-4 flex-1">
            {searchResults.map((profile) => (
              <div
                key={profile.id}
                onClick={() => onProfileClick(profile)}
                className="group cursor-pointer bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/10 transition-all duration-200 active:scale-[0.98]"
                data-testid={`card-search-result-${profile.id}`}
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm flex-shrink-0">
                    <AvatarFallback className="bg-slate-100 text-slate-600 font-semibold text-sm">
                      {profile.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-primary transition-colors">
                      {profile.firstName} {profile.lastName}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 mb-1">
                      {profile.role}
                    </p>
                    <p className="text-sm text-slate-600 mb-2 line-clamp-1">
                      {profile.summary}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <span>📍</span>
                      <span>Tel Aviv, Israel</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              No profiles found
            </h3>
            <p className="text-sm text-slate-500">
              Try a different name or adjust your filters.
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
  const [expandedAbout, setExpandedAbout] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handleRegenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      await fetch("/api/profiles/generate-ai", { method: "POST" });
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
      className="flex flex-col h-full bg-white overflow-y-auto pt-20"
    >
      <AppHeader
        title="הפרופיל שלי"
        leftIcon={<Share2 className="h-5 w-5" />}
        leftAction={() => {}}
        rightIcon={<Edit2 className="h-5 w-5" />}
        rightAction={() => {}}
      />

      {!hasProfile ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <UserPlus className="h-12 w-12 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 text-right">עדיין לא יצרת פרופיל</h3>
          <p className="text-sm text-slate-500 mb-8 text-right leading-relaxed">
            כדי שיוכלו למצוא אותך, צור פרופיל מקצועי קצר.
          </p>
          <button
            onClick={onCreateClick}
            className="px-8 py-3 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            data-testid="button-create-profile-empty"
          >
            צור פרופיל
          </button>
        </div>
      ) : (
        <>
      <div className="px-6 pb-8 pt-6">
        {/* Hero Profile Block */}
        <div className="flex flex-col items-center text-center mb-8">
          <Avatar className="h-28 w-28 mb-5 shadow-xl shadow-slate-200/80">
            {profile?.avatarUrl ? (
              <AvatarImage src={profile.avatarUrl} />
            ) : null}
            <AvatarFallback className="bg-slate-100 text-slate-700 text-3xl font-bold tracking-tight">
              {profile?.initials || "?"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-slate-900">
              {profile?.firstName} {profile?.lastName}
            </h2>
          </div>
          
          {profile?.aboutText && (
            <Badge className="mb-3 bg-blue-50 text-blue-700 border-blue-200 text-xs font-medium">
              ✨ נוצר עם AI
            </Badge>
          )}
          
          <p className="text-base text-primary font-medium mb-4">
            {profile?.role}
          </p>

          <div className="flex flex-col items-center gap-1.5 text-sm text-slate-500">
            {profile?.workArea && (
              <div className="flex items-center gap-1.5">
                <span>📍</span>
                <span>{profile.workArea}</span>
              </div>
            )}
            {profile?.businessName && (
              <div className="flex items-center gap-1.5">
                <span>💼</span>
                <span>{profile.businessName}</span>
              </div>
            )}
          </div>
        </div>

        {/* About Section */}
        <section className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#69707A] mb-4 text-right">
            עליי
          </h3>
          <div className={`relative rounded-xl border border-slate-100 bg-[#F9FBFF] p-5 overflow-hidden ${!expandedAbout ? 'max-h-40' : ''}`}>
            <div className="space-y-3">
              <p className="text-sm text-slate-700 leading-relaxed text-right">
                {profile?.aboutText || profile?.backgroundText || "לא נוסף תיאור עדיין"}
              </p>
            </div>
            {!expandedAbout && profile?.aboutText && profile.aboutText.length > 200 && (
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#F9FBFF] to-transparent pointer-events-none" />
            )}
          </div>
          {profile?.aboutText && profile.aboutText.length > 200 && (
            <button
              onClick={() => setExpandedAbout(!expandedAbout)}
              className="mt-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {expandedAbout ? "הצג פחות" : "קרא עוד"}
            </button>
          )}
        </section>

        {/* Skills Section */}
        <section className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#69707A] mb-4 text-right">
            שירותים עיקריים
          </h3>
          <div className="flex flex-wrap gap-2">
            {(profile?.skills || []).map((skill: string) => (
              <span 
                key={skill} 
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="mt-auto pt-6 space-y-3">
          <Button 
            className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          >
            Share profile
          </Button>
          <button
            className="w-full h-10 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all"
          >
            Edit profile
          </button>
        </div>
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
      className="flex flex-col h-full bg-white overflow-y-auto pt-20"
    >
      <AppHeader
        title="הגדרות"
        leftIcon={<ArrowLeft className="h-5 w-5" />}
        leftAction={onBack}
      />

      <div className="px-6 py-6 flex-1 flex flex-col pb-24 pt-2">
        <div className="space-y-6">
          
          {/* Section 1: Account */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#69707A] mb-3 text-right">חשבון</h3>
            <div className="bg-white rounded-xl border border-slate-100 px-4 py-3 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-800 font-medium text-right">מצב פרופיל</p>
                <button 
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  data-testid="button-create-profile"
                >
                  צור פרופיל
                </button>
              </div>
              <p className="text-sm text-slate-600 text-right">אין לך עדיין פרופיל</p>
              <p className="text-xs text-slate-500 pt-1 text-right">נהל את הפרופיל והפרטים של החשבון שלך.</p>
            </div>
          </section>

          {/* Section 2: Profile & AI */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#69707A] mb-3 text-right">פרופיל ו-AI</h3>
            <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-4">
              
              {/* Language Selection */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <label className="text-sm font-medium text-slate-900 text-right">שפת הפרופיל</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedLanguage("english")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      selectedLanguage === "english"
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                    data-testid="button-language-english"
                  >
                    אנגלית
                  </button>
                  <button 
                    onClick={() => setSelectedLanguage("hebrew")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      selectedLanguage === "hebrew"
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                    data-testid="button-language-hebrew"
                  >
                    עברית
                  </button>
                </div>
              </div>

              {/* Writing Style */}
              <div className="pb-4 border-b border-slate-100">
                <label className="text-sm font-medium text-slate-900 block mb-3 text-right">סגנון הפרופיל</label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedStyle("professional")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                      selectedStyle === "professional"
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                    data-testid="button-style-simple"
                  >
                    פשוט
                  </button>
                  <button
                    onClick={() => setSelectedStyle("friendly")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                      selectedStyle === "friendly"
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                    data-testid="button-style-detailed"
                  >
                    מפורט יותר
                  </button>
                </div>
              </div>

              {/* Regenerate Button */}
              <button 
                className="w-full px-4 py-2.5 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-blue-50 transition-colors"
                data-testid="button-regenerate-profile"
              >
                צור מחדש את הפרופיל שלי בעזרת AI
              </button>
            </div>
          </section>

          {/* Section 3: Privacy */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#69707A] mb-3 text-right">פרטיות ותצוגה</h3>
            <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-900 text-right">הצג את הפרופיל שלי בחיפוש הציבורי</label>
                <Switch 
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                  data-testid="toggle-public-profile"
                />
              </div>
              <p className="text-xs text-slate-500 text-right">כשזה כבוי, הפרופיל שלך לא יופיע בתוצאות חיפוש.</p>
            </div>
          </section>

          {/* Section 4: Notifications */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#69707A] mb-3 text-right">התראות</h3>
            <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-4">
              <div className="flex items-center justify-between py-2">
                <label className="text-sm font-medium text-slate-900 text-right">שלח לי דוא״ל כאשר מישהו צופה בפרופיל שלי</label>
                <Switch 
                  checked={emailViews}
                  onCheckedChange={setEmailViews}
                  data-testid="toggle-email-views"
                />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-slate-100 pt-4">
                <label className="text-sm font-medium text-slate-900 text-right">שלח לי טיפים לשיפור הפרופיל שלי</label>
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
            <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 text-right">על האפליקציה</h3>
              <p className="text-xs text-slate-600 leading-relaxed text-right">
                האפליקציה עוזרת לעובדים במקצועות יומיומיים ליצור פרופיל פשוט וברור, כדי שלקוחות יוכלו למצוא אותם בקלות.
              </p>
              <p className="text-xs text-slate-500 text-right">גרסה 0.1.0</p>
              <button 
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors text-right block"
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
              className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              data-testid="button-delete-profile"
            >
              מחק את הפרופיל שלי
            </button>
          </section>

        </div>
      </div>
    </motion.div>
  );
}
