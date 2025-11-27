import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft, Share2, UserPlus, CheckCircle2 } from "lucide-react";
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
    about: "I am a product designer with over 10 years of experience in building user-centric interfaces. My passion lies in simplifying complex workflows and creating design systems that scale. Currently leading design at a stealth AI startup.",
    skills: ["Product Design", "Figma", "Design Systems", "Prototyping", "UX Research"],
    initials: "DA",
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Chen",
    role: "Frontend Engineer",
    summary: "Specializing in React, TypeScript, and performance optimization.",
    about: "Full-stack developer turned frontend specialist. I love building buttery smooth UIs and obsessing over web performance metrics. Contributor to several open source UI libraries.",
    skills: ["React", "TypeScript", "Tailwind CSS", "Next.js", "WebGl"],
    initials: "SC",
  },
  {
    id: "3",
    firstName: "Marcus",
    lastName: "Johnson",
    role: "AI Researcher",
    summary: "Exploring the intersection of LLMs and human-computer interaction.",
    about: "PhD in Computer Science focused on NLP. I'm working on making AI agents more helpful and reliable for everyday tasks. Excited about the future of generative interfaces.",
    skills: ["Python", "PyTorch", "NLP", "Machine Learning", "React"],
    initials: "MJ",
  },
  {
    id: "4",
    firstName: "Elena",
    lastName: "Rodriguez",
    role: "Marketing Lead",
    summary: "Growth hacking and brand storytelling for tech startups.",
    about: "I help technical founders translate their complex products into compelling narratives. Experienced in B2B SaaS marketing and community building.",
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
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full p-6"
    >
      {/* Top Bar */}
      <header className="flex items-center justify-between mb-8 pt-2">
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

      {/* Search */}
      <div className="relative mb-8 group">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
          <Search className="h-5 w-5" />
        </div>
        <Input 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search profiles by full name"
          className="pl-10 h-14 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary text-base"
          data-testid="input-search"
        />
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
        <div className="w-10" /> {/* Spacer to balance the header */}
      </div>

      <div className="px-6 pb-8 pt-2">
        {/* Hero Profile Block */}
        <div className="flex flex-col items-center text-center mb-10">
          <Avatar className="h-28 w-28 mb-5 shadow-xl shadow-slate-200/80">
            <AvatarFallback className="bg-slate-100 text-slate-700 text-3xl font-bold tracking-tight">
              {profile.initials}
            </AvatarFallback>
          </Avatar>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-1" data-testid="text-profile-name">
            {profile.firstName} {profile.lastName}
          </h2>
          
          <p className="text-base text-primary font-medium mb-3">
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
        <section className="mb-10">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#69707A] mb-4">
            About
          </h3>
          <p className="text-slate-700 leading-relaxed text-base text-left">
            {profile.about}
          </p>
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
        <span className="ml-2 font-medium text-slate-900">Join Directory</span>
      </div>

      <div className="px-6 py-8 flex-1 flex flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Join the directory
          </h2>
          <p className="text-slate-500 text-lg">
            Create your public professional profile so others can find you.
          </p>
        </div>

        <form className="space-y-6 flex-1" onSubmit={(e) => e.preventDefault()}>
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

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">About you</label>
            <Textarea 
              placeholder="Tell us a bit about your background..." 
              className="min-h-[120px] rounded-xl border-slate-200 focus:border-primary bg-slate-50 resize-none p-3"
              data-testid="input-join-about"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Skills</label>
            <Input 
              placeholder="Product Manager, React, Cyber Security..." 
              className="h-12 rounded-xl border-slate-200 focus:border-primary bg-slate-50"
              data-testid="input-join-skills"
            />
            <p className="text-xs text-slate-400 px-1">Separate skills with commas</p>
          </div>

          <div className="pt-4 mt-auto">
            <Button 
              className="w-full h-14 text-lg font-semibold rounded-xl shadow-xl shadow-primary/25 transition-transform active:scale-[0.99]"
              type="submit"
              data-testid="button-create-profile"
            >
              Create my profile
            </Button>
            <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              In the future, AI will generate your profile text automatically.
            </p>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
