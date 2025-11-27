import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Sparkles, Search, TrendingUp, User, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: 1,
      title: "ברוך הבא!",
      description: "צרו פרופיל מקצועי וברור כדי שמעסיקים יוכלו למצוא אתכם במהירות.",
      icon: <Sparkles className="w-24 h-24 text-primary" />,
    },
    {
      id: 2,
      title: "מעסיקים מחפשים עובדים טובים",
      description: "הוסיפו את התפקיד, הניסיון שלכם והשירותים שאתם נותנים — כדי להופיע בחיפושים רלוונטיים.",
      icon: <Search className="w-24 h-24 text-primary" />,
    },
    {
      id: 3,
      title: "בלטו מעל כולם",
      description: "פרופיל מלא ואיכותי מקדם אתכם בתוצאות החיפוש ומגדיל את הסיכוי לקבל פניות עבודה.",
      icon: <TrendingUp className="w-24 h-24 text-primary" />,
    },
    {
      id: 4,
      title: "ספרו בקצרה עליכם",
      description: "כמה מילים על הניסיון שלכם, אזור העבודה ומה אתם מציעים — וזהו, אתם מוכנים לצאת לדרך.",
      icon: <User className="w-24 h-24 text-primary" />,
    },
    {
      id: 5,
      title: "התחילו עכשיו",
      description: "צרו פרופיל ותנו למעסיקים המתאימים למצוא אתכם.",
      icon: <Rocket className="w-24 h-24 text-primary" />,
      isLast: true,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div dir="rtl" className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-between p-6 max-w-[480px] mx-auto shadow-2xl">
      {/* Top Bar (Skip) */}
      <div className="w-full flex justify-end pt-4">
        {currentStep < steps.length - 1 && (
          <button
            onClick={onComplete}
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            דלג
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full text-center space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center space-y-8"
          >
            <div className="bg-blue-50 p-8 rounded-full mb-4">
              {steps[currentStep].icon}
            </div>
            
            <div className="space-y-4 max-w-xs">
              <h2 className="text-2xl font-bold text-slate-900">
                {steps[currentStep].title}
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                {steps[currentStep].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="w-full space-y-6 pb-8">
        {/* Dots Indicator */}
        <div className="flex justify-center gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep ? "w-8 bg-primary" : "w-2 bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Button */}
        <Button
          onClick={handleNext}
          className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg shadow-primary/20"
        >
          {steps[currentStep].isLast ? "התחלת יצירת פרופיל" : "המשך"}
          {!steps[currentStep].isLast && <ChevronLeft className="mr-2 h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
