"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, Sparkles, CheckCircle2 } from "lucide-react";

/**
 * Additional Information (styled)
 *
 * Props:
 * - currentSection, totalSections
 * - defaultValues: { notes?: string }
 * - onPrevious: () => void
 * - onSubmit: (vals) => void
 * - onGeneratePlan: () => void          // ✅ added
 */
export default function QuizSectionExtras({
  currentSection = 11,
  totalSections = 11,
  defaultValues = {},
  onPrevious,
  onSubmit,
  onGeneratePlan, // ✅ added
}) {
  const [val, setVal] = useState({
    notes: defaultValues.notes || "",
  });

  // keep normal page background for this page
  useEffect(() => {
    document.body.classList.remove("glass-bg");
  }, []);

  const percent = useMemo(
    () => Math.round((currentSection / Math.max(1, totalSections)) * 100),
    [currentSection, totalSections]
  );

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    setSubmitted(true);

    // Only advance when Continue is clicked (kept for compatibility)
    const submitter = e?.nativeEvent?.submitter;
    const isContinue = submitter && submitter.id === "continueBtn";
    if (!isContinue) return;

    onSubmit?.(val);
  };

  // ✅ Generate Plan handler (save + generate)
  const handleGenerate = () => {
    setSubmitted(true);
    onSubmit?.(val);
    onGeneratePlan?.();
  };

  // Block Enter-based submits (textarea still allows newlines by default,
  // but we keep this for consistency across sections)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.target?.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };

  const words = val.notes.trim() ? val.notes.trim().split(/\s+/).length : 0;

  return (
    <div className="relative min-h-[100dvh] flex items-start justify-center overflow-hidden">
      <div className="w-full max-w-5xl px-4 md:px-6 pt-8 pb-24">
        {/* Top bar (lighter on mobile, blur on md+) */}
        <div className="sticky top-0 z-10 -mx-4 md:-mx-6 mb-6 bg-white/80 md:bg-white/60 md:backdrop-blur-md border-b shadow-sm">
          <div className="px-4 md:px-6 py-3 flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600">
              Section {currentSection} of {totalSections}
            </span>
            <div className="flex-1" />
            <span className="text-sm text-slate-500">{percent}% Complete</span>
          </div>
          <div className="px-4 md:px-6 pb-3">
            <Progress
              value={percent}
              className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:via-rose-500 [&>div]:to-indigo-500"
            />
          </div>
        </div>

        {/* Card (solid, cheaper than glass) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative rounded-2xl shadow-sm bg-white p-6 md:p-8"
        >
          {/* Corner badge to match other sections */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute -top-3 -right-3 bg-black text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
          >
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> guided
            </span>
          </motion.div>

          {/* Header */}
          <header className="text-center space-y-3 mb-6">
            <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-500" />
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Additional Information
            </h1>
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-indigo-600">
              Any other important details for your business plan
            </p>
          </header>

          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-8">
            <Field
              label="Any additional notes or special considerations?"
              description="Anything else you'd like to include in your business plan"
            >
              <Lift>
                <Textarea
                  value={val.notes}
                  onChange={(e) => setVal({ notes: e.target.value })}
                  rows={6}
                  placeholder="e.g., Special partnerships, unique challenges, regulatory considerations"
                  className="text-lg leading-7 bg-transparent border-0 focus-visible:ring-0 focus-visible:outline-none"
                />
              </Lift>
              <div className="text-xs text-slate-500 mt-1">{words} words</div>
            </Field>

            {/* Nav */}
            <div className="pt-2 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                className="rounded-xl px-6"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Section
              </Button>

              {/* ✅ Generate Plan button */}
              <Button
                type="button"
                onClick={handleGenerate}
                className="
                    rounded-2xl px-10 py-4  font-semibold text-white
                    bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-500
                    hover:from-orange-600 hover:via-rose-600 hover:to-indigo-600
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
                    active:scale-[0.98] active:opacity-95
                    transition-all duration-200 shadow-md
                    disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                Generate Plan
              </Button>
            </div>

            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 flex items-center gap-2 text-emerald-600 text-sm"
                >
                  <CheckCircle2 className="h-4 w-4" /> Saved!
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

/* --- small UI helpers --- */
function Field({ label, description, children }) {
  return (
    <div className="space-y-2">
      <Label className="text-lg font-semibold leading-7">{label}</Label>
      {description && <p className="text-base text-slate-600 leading-7">{description}</p>}
      {children}
    </div>
  );
}

function Lift({ children }) {
  return (
    <div className="group relative rounded-2xl">
      <div
        className="
          rounded-2xl bg-white
          border-2 border-indigo-200
          px-3 py-2
          transition-colors
          group-focus-within:border-indigo-400
          group-focus-within:ring-2 group-focus-within:ring-indigo-500/30
        "
      >
        {children}
      </div>
    </div>
  );
}
