import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft, Share2, UserPlus, CheckCircle2, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// --- Types ---
type Screen = "home" | "profile" | "join";

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
    firstName: "Dor",
    lastName: "Aharonoff",
    role: "Senior Product Designer",
    summary: "Crafting intuitive digital experiences for enterprise SaaS.",
    about: "I am a product designer with over 10 years of experience in building user-centric interfaces. My passion lies in simplifying complex workflows and creating design systems that scale. Currently leading design at a stealth AI startup.\n\nThroughout my career, I've worked with teams at companies like Figma and Stripe, where I learned the art of balancing aesthetic beauty with functional precision. I'm particularly interested in how design systems can empower teams to move faster while maintaining consistency across products. I believe great design is invisible—it should feel natural and intuitive to the user.\n\nOutside of work, I'm passionate about mentoring junior designers and contributing to the design community. I regularly speak at conferences and maintain a design blog where I share my thoughts on emerging trends in product design, accessibility, and design thinking methodologies.",
    skills: ["Product Design", "Figma", "Design Systems", "Prototyping", "UX Research"],
    initials: "DA",
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Chen",
    role: "Frontend Engineer",
    summary: "Specializing in React, TypeScript, and performance optimization.",
    about: "Full-stack developer turned frontend specialist. I love building buttery smooth UIs and obsessing over web performance metrics. Contributor to several open source UI libraries and passionate about accessibility.\n\nI've spent the last 5 years shipping features at scale, learning that great frontend engineering is about more than just writing clean code—it's about understanding user behavior, optimizing for performance, and building with accessibility in mind. My approach combines technical excellence with pragmatism: I believe in shipping quickly but not compromising on quality.\n\nI'm particularly interested in React's future and am actively involved in the React community. I've given talks on performance optimization and web performance best practices. When I'm not coding, I contribute to open source projects and help junior developers navigate their careers in frontend development.",
    skills: ["React", "TypeScript", "Tailwind CSS", "Next.js", "Web Performance"],
    initials: "SC",
  },
  {
    id: "3",
    firstName: "Marcus",
    lastName: "Johnson",
    role: "AI Researcher",
    summary: "Exploring the intersection of LLMs and human-computer interaction.",
    about: "PhD in Computer Science focused on Natural Language Processing. I'm working on making AI agents more helpful and reliable for everyday tasks. Currently focused on improving interpretability and alignment of large language models.\n\nMy research bridges the gap between cutting-edge NLP research and practical applications. I believe AI should augment human capabilities, not replace them. I've published papers on prompt engineering, fine-tuning strategies, and human-AI collaboration patterns that have been adopted by teams at leading AI companies.\n\nI'm excited about the future of generative interfaces and how they'll reshape the way we interact with technology. I'm actively mentoring PhD students and collaborating with industry partners to turn research into real-world solutions. In my spare time, I tinker with new model architectures and explore how AI can be more accessible to developers.",
    skills: ["Python", "PyTorch", "NLP", "Machine Learning", "LLMs"],
    initials: "MJ",
  },
  {
    id: "4",
    firstName: "Elena",
    lastName: "Rodriguez",
    role: "Marketing Lead",
    summary: "Growth hacking and brand storytelling for tech startups.",
    about: "I help technical founders translate their complex products into compelling narratives that resonate with their target audience. With 8+ years of B2B SaaS marketing experience, I've built communities from zero to thousands and led campaigns that drove millions in ARR.\n\nMy approach combines data-driven insights with creative storytelling. I believe the best marketing starts with truly understanding your users—their pain points, aspirations, and language. I specialize in positioning, content strategy, and community building for developer-focused products and enterprise solutions.\n\nI'm passionate about building authentic relationships with customers and creating marketing that doesn't feel like marketing. I've successfully led GTM strategies for multiple successful exits and currently advise several early-stage startups on growth. I love mentoring marketers and sharing what I've learned about building sustainable, human-centered growth.",
    skills: ["Growth Marketing", "Content Strategy", "SEO", "Brand Identity"],
    initials: "ER",
  }
];

export default function AIProfileApp() {
  const [activeScreen, setActiveScreen] = useState<Screen>("home");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  return (
    <div className="min-h-screen bg-slate-50/50 flex justify-center font-sans text-slate-900">
      {/* Mobile Container */}
      <div className="w-full max-w-[480px] bg-white min-h-screen shadow-2xl shadow-slate-200/50 flex flex-col relative overflow-hidden">
        
        <AnimatePresence mode="wait">
          {activeScreen === "home" && (
            <HomeScreen 
              key="home"
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              profiles={filteredProfiles}
              onProfileClick={handleProfileClick}
              onJoinClick={handleJoinClick}
            />
          )}

          {activeScreen === "profile" && selectedProfile && (
            <ProfileScreen 
              key="profile"
              profile={selectedProfile}
              onBack={handleBack}
            />
          )}

          {activeScreen === "join" && (
            <JoinScreen 
              key="join"
              onBack={handleBack}
            />
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

  const quickFilterCategories = ["Design", "Engineering", "Product", "Data / AI"];
  const roleOptions = ["Product", "Design", "Engineering", "Data/AI", "Marketing", "Sales", "Other"];
  const seniorityOptions = ["Junior", "Mid-level", "Senior", "Lead / Manager"];
  const workStyleOptions = ["On-site", "Hybrid", "Remote"];

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
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          AI Profile Directory
        </h1>
        <Button 
          onClick={onJoinClick}
          size="sm" 
          className="rounded-full px-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
          data-testid="button-join"
        >
          Join
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
            placeholder="Search profiles by full name"
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
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Role</h3>
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
                  <label className="text-sm font-semibold text-slate-900 mb-2 block">Location</label>
                  <Input
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    placeholder="e.g. Tel Aviv, Remote, Europe"
                    className="h-10 rounded-lg border-slate-200 bg-slate-50 text-sm"
                    data-testid="filter-location"
                  />
                </section>

                {/* Seniority Filter */}
                <section className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Seniority</h3>
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
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Work style</h3>
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
                    Clear all
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 px-4 py-3 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
                    data-testid="button-apply-filters"
                  >
                    Apply filters
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
          
          <h2 className="text-2xl font-bold text-slate-900 mb-1" data-testid="text-profile-name">
            {profile.firstName} {profile.lastName}
          </h2>
          
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
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#69707A] mb-4">
            About
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
        <section className="mb-12">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#69707A] mb-4">
            Skills
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {profile.skills.map((skill) => (
              <span 
                key={skill} 
                className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-[#F2F4F7] text-slate-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Action Button */}
        <div className="mt-auto pt-4">
          <Button 
            className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            data-testid="button-share-profile"
          >
            Share Profile
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function JoinScreen({ onBack }: { onBack: () => void }) {
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
        <span className="ml-2 font-medium text-slate-900">Create Your Profile</span>
      </div>

      <div className="px-6 py-8 flex-1 flex flex-col">
        <form className="space-y-6 flex-1 flex flex-col" onSubmit={(e) => e.preventDefault()}>
          {/* Form Fields */}
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <Input 
                placeholder="e.g. Alex Morgan" 
                className="h-12 rounded-xl border-slate-200 focus:border-primary bg-slate-50"
                data-testid="input-join-name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Current Role / Title</label>
              <Input 
                placeholder="e.g. Senior Engineer" 
                className="h-12 rounded-xl border-slate-200 focus:border-primary bg-slate-50"
                data-testid="input-join-role"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Location <span className="text-slate-400 font-normal">(Optional)</span></label>
                <Input 
                  placeholder="City, Country" 
                  className="h-12 rounded-xl border-slate-200 focus:border-primary bg-slate-50"
                  data-testid="input-join-location"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Company <span className="text-slate-400 font-normal">(Optional)</span></label>
                <Input 
                  placeholder="Company Name" 
                  className="h-12 rounded-xl border-slate-200 focus:border-primary bg-slate-50"
                  data-testid="input-join-company"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Skills</label>
              <Input 
                placeholder="e.g. Product Manager, React, Cyber Security..." 
                className="h-12 rounded-xl border-slate-200 focus:border-primary bg-slate-50"
                data-testid="input-join-skills"
              />
            </div>
          </div>

          {/* AI Preview Card */}
          <div className="mt-8 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#69707A] mb-3">
              AI-Generated Profile Preview
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
              Generate My Profile with AI
            </Button>
            <p className="text-center text-xs text-slate-400">
              AI will instantly generate a polished professional profile for you.
            </p>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
