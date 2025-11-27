import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft, Share2, UserPlus, CheckCircle2, Filter, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

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

// --- Mock Data ---
const MOCK_PROFILES: Profile[] = [
  {
    id: "1",
    firstName: "Roni",
    lastName: "Levi",
    role: "Certified Electrician",
    summary: "Specializing in home electrical repairs and small installations.",
    about: "I've been working as an electrician for 15 years. I handle all types of home electrical repairs, from fixing short circuits to installing new lights and power outlets. I also work with small offices and shops.\n\nI'm based in Holon and I cover all nearby areas. My customers say I'm reliable, honest, and I always give clear prices before starting any work. I handle emergency calls too if there are any dangerous situations.\n\nI'm certified and I always follow safety rules. I work carefully and clean up after myself. Whether it's a small repair or a bigger job, I treat every customer the same—with respect and quality work.",
    skills: ["Home electrical repairs", "Short-circuit fixing", "Lighting installation", "Electric panel upgrades", "Emergency calls"],
    initials: "RL",
  },
  {
    id: "2",
    firstName: "Sara",
    lastName: "Cohen",
    role: "Home Cleaner",
    summary: "Reliable weekly cleaning for families and offices.",
    about: "I've been a professional cleaner for 12 years. I do deep cleaning and regular maintenance for homes, small offices, and shops. I work carefully and make sure everything is spotless.\n\nI'm based in Tel Aviv and I cover the surrounding areas. I work on a regular schedule—weekly or monthly—so your space is always clean. I use good cleaning products and I'm happy to use what you prefer if you have allergies.\n\nMy customers trust me with their keys because I'm professional and respectful. I finish on time, I pay attention to details, and I'm very honest. I can work with your schedule and I'm flexible with timing.",
    skills: ["Deep cleaning", "Weekly maintenance", "Office cleaning", "Home organization", "Eco-friendly products"],
    initials: "SC",
  },
  {
    id: "3",
    firstName: "Ahmed",
    lastName: "Nassar",
    role: "Delivery Driver",
    summary: "Same-day deliveries around Tel Aviv and nearby cities.",
    about: "I'm a delivery driver with 8 years of experience. I deliver packages, furniture, groceries, and more. I know the Tel Aviv area very well and I'm fast and reliable.\n\nI take good care of packages—they arrive safe and on time. My customers appreciate that I'm professional, I'm on time, and I handle everything carefully. I have a large van and I can carry most things.\n\nI work flexible hours, so I can often make same-day deliveries. I'm friendly with customers and I always keep them updated about delivery times. I've had many repeat customers because they know they can rely on me.",
    skills: ["Local deliveries", "Same-day service", "Furniture moving", "Package handling", "Route knowledge"],
    initials: "AN",
  },
  {
    id: "4",
    firstName: "Miriam",
    lastName: "Goldman",
    role: "Hairdresser & Stylist",
    summary: "Professional hair cutting and styling services.",
    about: "I'm a professional hairdresser with 10 years of experience. I do cuts, styling, coloring, and treatments. I work with all hair types and I always listen to what my customers want.\n\nI have a small salon in Ramat Gan and I create a friendly, relaxed atmosphere. I care about my customers' comfort and I take time to understand their style needs. I use good quality products for all treatments.\n\nMany of my customers are regulars because they know I do quality work at fair prices. I can also do hair for special events like weddings and parties. I'm passionate about making people feel good about how they look.",
    skills: ["Hair cutting", "Styling & coloring", "Treatments", "Special events", "Perms & treatments"],
    initials: "MG",
  }
];

export default function AIProfileApp() {
  const [activeTab, setActiveTab] = useState<"directory" | "create" | "profile" | "settings">("directory");
  const [activeScreen, setActiveScreen] = useState<Screen>("home");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Derived state
  const filteredProfiles = MOCK_PROFILES.filter((p) => {
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

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50/50 flex justify-center font-sans text-slate-900">
      {/* Mobile Container */}
      <div className="w-full max-w-[480px] bg-white min-h-screen shadow-2xl shadow-slate-200/50 flex flex-col relative overflow-hidden pb-20">
        
        <AnimatePresence mode="wait">
          {activeTab === "settings" && (
            <SettingsScreen 
              key="settings" 
              onBack={() => setActiveTab("directory")}
            />
          )}

          {activeTab === "profile" && (
            <MyProfileScreen 
              key="myProfile"
              demoProfile={MOCK_PROFILES[0]}
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
            />
          )}

          {activeTab === "directory" && activeScreen === "searchResults" && (
            <SearchResultsScreen
              key="searchResults"
              searchQuery={searchQuery}
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
  onJoinClick 
}: { 
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  profiles: Profile[];
  onProfileClick: (p: Profile) => void;
  onJoinClick: () => void;
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
      className="flex flex-col h-full p-6 relative"
    >
      {/* Top Bar */}
      <header className="flex items-center justify-between mb-6 pt-2">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 text-right">
          פרופילים לעבודה
        </h1>
        <Button 
          onClick={onJoinClick}
          size="sm" 
          className="rounded-full px-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
          data-testid="button-join"
        >
          צור פרופיל
        </Button>
      </header>

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
      {/* Header - Clean, no border */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md px-4 py-4 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-600 transition-colors"
          data-testid="button-back"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <span className="font-semibold text-slate-900">Profile</span>
        <div className="w-10" />
      </div>

      <div className="px-6 pb-8 pt-2">
        {/* Hero Profile Block */}
        <div className="flex flex-col items-center text-center mb-8">
          <Avatar className="h-28 w-28 mb-5 shadow-xl shadow-slate-200/80">
            <AvatarFallback className="bg-slate-100 text-slate-700 text-3xl font-bold tracking-tight">
              {profile.initials}
            </AvatarFallback>
          </Avatar>
          
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
              <span>Tel Aviv, Israel</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>💼</span>
              <span>Independent / Freelance</span>
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
                <p key={idx} className="text-sm text-slate-700 leading-relaxed text-left">
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
            {expandedAbout ? "Show less" : "Read more"}
          </button>
        </section>

        {/* Skills Section */}
        <section className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#69707A] mb-4">
            Skills
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
            Share profile
          </Button>
          <button
            className="w-full h-10 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all"
            data-testid="button-edit-profile"
          >
            Edit profile
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function JoinScreen({ onBack }: { onBack: () => void }) {
  const [backgroundNotes, setBackgroundNotes] = useState("");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full bg-white overflow-y-auto"
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
          data-testid="button-back-join"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <span className="ml-2 font-medium text-slate-900 text-right">יצירת פרופיל</span>
      </div>

      <div className="px-6 py-8 flex-1 flex flex-col">
        <form className="space-y-6 flex-1 flex flex-col" onSubmit={(e) => e.preventDefault()}>
          {/* Form Fields */}
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 text-right block">שם מלא</label>
              <Input 
                placeholder="לדוגמה: רוני לוי" 
                className="h-12 rounded-xl border-slate-200 focus:border-primary bg-slate-50"
                data-testid="input-join-name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 text-right block">תחום עבודה / תפקיד</label>
              <Input 
                placeholder="לדוגמה: חשמלאי, אינסטלטור, עוזרת בית" 
                className="h-12 rounded-xl border-slate-200 focus:border-primary bg-slate-50"
                data-testid="input-join-role"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 text-right block">אזור עבודה <span className="text-slate-400 font-normal">(לא חובה)</span></label>
                <Input 
                  placeholder="לדוגמה: אזור תל אביב" 
                  className="h-12 rounded-xl border-slate-200 focus:border-primary bg-slate-50"
                  data-testid="input-join-location"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 text-right block">שם העסק <span className="text-slate-400 font-normal">(לא חובה)</span></label>
                <Input 
                  placeholder="לדוגמה: רוני חשמל בע״מ" 
                  className="h-12 rounded-xl border-slate-200 focus:border-primary bg-slate-50"
                  data-testid="input-join-company"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 text-right block">שירותים / כישורים</label>
              <Input 
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
              className="w-full h-14 text-lg font-semibold rounded-xl shadow-xl shadow-primary/25 hover:shadow-primary/35 transition-all active:scale-[0.99] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none"
              type="submit"
              data-testid="button-generate-profile"
            >
              <span className="mr-2 text-xl">✨</span>
              צור לי פרופיל בעזרת AI
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
}: {
  searchQuery: string;
  onBack: () => void;
  onProfileClick: (profile: Profile) => void;
}) {
  const [sortBy, setSortBy] = useState("Relevance");

  // Filter results by search query
  const searchResults = MOCK_PROFILES.filter((p) => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full bg-white overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-600 transition-colors"
          data-testid="button-back-search"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <span className="font-semibold text-slate-900">Search results</span>
      </div>

      <div className="px-6 pb-6 flex-1 flex flex-col">
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
  demoProfile,
}: {
  demoProfile: Profile;
}) {
  const [expandedAbout, setExpandedAbout] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full bg-white overflow-y-auto"
    >
      <div className="px-6 pb-8 pt-6">
        {/* Hero Profile Block */}
        <div className="flex flex-col items-center text-center mb-8">
          <Avatar className="h-28 w-28 mb-5 shadow-xl shadow-slate-200/80">
            <AvatarFallback className="bg-slate-100 text-slate-700 text-3xl font-bold tracking-tight">
              RL
            </AvatarFallback>
          </Avatar>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-slate-900">
              Roni Levi
            </h2>
          </div>
          
          <Badge className="mb-3 bg-blue-50 text-blue-700 border-blue-200 text-xs font-medium">
            ✨ Profile written with AI
          </Badge>
          
          <p className="text-base text-primary font-medium mb-4">
            Certified Electrician
          </p>

          <div className="flex flex-col items-center gap-1.5 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <span>📍</span>
              <span>Holon, Israel</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>💼</span>
              <span>Roni Electric Services</span>
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
              <p className="text-sm text-slate-700 leading-relaxed text-left">I've been working as an electrician for 15 years. I handle all types of home electrical repairs, from fixing short circuits to installing new lights and power outlets. I also work with small offices and shops.</p>
              <p className="text-sm text-slate-700 leading-relaxed text-left">I'm based in Holon and I cover all nearby areas. My customers say I'm reliable, honest, and I always give clear prices before starting any work. I handle emergency calls too if there are any dangerous situations.</p>
              <p className="text-sm text-slate-700 leading-relaxed text-left">I'm certified and I always follow safety rules. I work carefully and clean up after myself. Whether it's a small repair or a bigger job, I treat every customer the same—with respect and quality work.</p>
            </div>
            {!expandedAbout && (
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#F9FBFF] to-transparent pointer-events-none" />
            )}
          </div>
          <button
            onClick={() => setExpandedAbout(!expandedAbout)}
            className="mt-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {expandedAbout ? "Show less" : "Read more"}
          </button>
        </section>

        {/* Skills Section */}
        <section className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#69707A] mb-4 text-right">
            שירותים עיקריים
          </h3>
          <div className="flex flex-wrap gap-2">
            {["Home electrical repairs", "Short-circuit fixing", "Lighting installation", "Electric panel upgrades", "Emergency calls"].map((skill) => (
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
    </motion.div>
  );
}

function SettingsScreen({ onBack }: { onBack: () => void }) {
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
      className="flex flex-col h-full bg-white overflow-y-auto"
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
          data-testid="button-back-settings"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <span className="ml-2 font-medium text-slate-900">Settings</span>
      </div>

      <div className="px-6 py-6 flex-1 flex flex-col pb-24">
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
                  Create profile
                </button>
              </div>
              <p className="text-sm text-slate-600">No profile yet</p>
              <p className="text-xs text-slate-500 pt-1">Manage your profile and account details.</p>
            </div>
          </section>

          {/* Section 2: Profile & AI */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#69707A] mb-3">Profile & AI</h3>
            <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-4">
              
              {/* Language Selection */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <label className="text-sm font-medium text-slate-900">Profile language</label>
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
                    English
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
                    Hebrew
                  </button>
                </div>
              </div>

              {/* Writing Style */}
              <div className="pb-4 border-b border-slate-100">
                <label className="text-sm font-medium text-slate-900 block mb-3">Profile style</label>
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
                    Simple
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
                    More detailed
                  </button>
                </div>
              </div>

              {/* Regenerate Button */}
              <button 
                className="w-full px-4 py-2.5 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-blue-50 transition-colors"
                data-testid="button-regenerate-profile"
              >
                Regenerate my profile with AI
              </button>
            </div>
          </section>

          {/* Section 3: Privacy */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#69707A] mb-3">Privacy & visibility</h3>
            <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-900">Show my profile in public directory</label>
                <Switch 
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                  data-testid="toggle-public-profile"
                />
              </div>
              <p className="text-xs text-slate-500">When turned off, your profile will not appear in search results.</p>
            </div>
          </section>

          {/* Section 4: Notifications */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#69707A] mb-3">Notifications</h3>
            <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-4">
              <div className="flex items-center justify-between py-2">
                <label className="text-sm font-medium text-slate-900">Email me when someone views my profile</label>
                <Switch 
                  checked={emailViews}
                  onCheckedChange={setEmailViews}
                  data-testid="toggle-email-views"
                />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-slate-100 pt-4">
                <label className="text-sm font-medium text-slate-900">Send tips to improve my profile</label>
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
              <h3 className="text-sm font-semibold text-slate-900">About this app</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                This app helps workers in everyday jobs create a simple profile so people can find and contact them.
              </p>
              <p className="text-xs text-slate-500">Version 0.1.0</p>
              <button 
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                data-testid="button-send-feedback"
              >
                Send feedback
              </button>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="pt-4 pb-8 text-center">
            <button 
              className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              data-testid="button-delete-profile"
            >
              Delete my profile
            </button>
          </section>

        </div>
      </div>
    </motion.div>
  );
}
