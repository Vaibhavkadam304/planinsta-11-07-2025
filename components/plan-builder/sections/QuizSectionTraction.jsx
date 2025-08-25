"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Plus, Minus, ChevronLeft, Sparkles, CheckCircle2 } from "lucide-react";

export default function QuizSectionTraction({
  currentSection = 10,
  totalSections = 11,
  defaultValues = {},
  onPrevious,
  onSubmit,
}) {
  const [val, setVal] = useState({
    achievements:
      Array.isArray(defaultValues.achievements) && defaultValues.achievements.length
        ? defaultValues.achievements
        : ["", ""],
    upcomingMilestone: defaultValues.upcomingMilestone || "",
  });

  useEffect(() => {
    document.body.classList.remove("glass-bg");
  }, []);

  const percent = useMemo(
    () => Math.round((currentSection / Math.max(1, totalSections)) * 100),
    [currentSection, totalSections]
  );

  const [submitted, setSubmitted] = useState(false);

  const setField = (k) => (eOrV) =>
    setVal((v) => ({ ...v, [k]: eOrV?.target ? eOrV.target.value : eOrV }));

  const setAchievement = (i, text) =>
    setVal((v) => {
      const next = [...v.achievements];
      next[i] = text;
      return { ...v, achievements: next };
    });

  const addAchievement = () =>
    setVal((v) => ({ ...v, achievements: [...v.achievements, ""] }));

  const removeAchievement = (i) =>
    setVal((v) => {
      const next = [...v.achievements];
      if (next.length > 1) next.splice(i, 1);
      return { ...v, achievements: next };
    });

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    setSubmitted(true);
    const submitter = e?.nativeEvent?.submitter;
    const isContinue = submitter && submitter.id === "continueBtn";
    if (!isContinue) return;
    onSubmit?.(val);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.target?.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex items-start justify-center overflow-hidden">
      <div className="w-full max-w-5xl px-4 md:px-6 pt-8 pb-24">
        {/* Top bar */}
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

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative rounded-2xl shadow-sm bg-white p-6 md:p-8"
        >
          {/* Corner badge */}
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
              Traction &amp; Milestones
            </h1>
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-indigo-600">
              Share your achievements and upcoming goals
            </p>
          </header>

          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-8">
            {/* Achievements */}
            <Field
              label="What are your key achievements so far?"
              description="Major milestones or accomplishments you've reached"
            >
              <div className="space-y-3">
                {val.achievements.map((a, i) => (
                  <div key={`ach-${i}`} className="flex items-center gap-3">
                    {/* The magic: flex-1 + min-w-0 so the input can actually grow */}
                    <div className="flex-1 min-w-0">
                      <Lift className="w-full">
                        <Input
                          value={a}
                          onChange={(e) => setAchievement(i, e.target.value)}
                          placeholder={
                            i === 0
                              ? "e.g., Launched MVP with 50 beta users"
                              : "e.g., Closed 5 pilot customers"
                          }
                          className="w-full h-12 text-lg leading-7 bg-transparent border-0 focus-visible:ring-0"
                        />
                      </Lift>
                    </div>

                    {val.achievements.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl shrink-0"
                        onClick={() => removeAchievement(i)}
                        aria-label="Remove achievement"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={addAchievement}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </Field>

            {/* Upcoming Milestone */}
            <Field
              label="What's your next major milestone?"
              description="The next big goal you're working towards"
            >
              <Lift className="w-full">
                <Textarea
                  value={val.upcomingMilestone}
                  onChange={setField("upcomingMilestone")}
                  rows={4}
                  placeholder="e.g., Reach $10K MRR by end of quarter"
                  className="w-full text-lg leading-7 bg-transparent border-0 focus-visible:ring-0"
                />
              </Lift>
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
              <Button id="continueBtn" type="submit" className="
                    rounded-xl px-6 py-2.5
                    bg-white text-slate-900 border border-slate-300
                    hover:bg-orange-600 hover:text-white hover:bg-indigo-700
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2
                    active:scale-[0.98] transition-colors duration-200
                ">
                Continue
              </Button>
            </div>

            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-emerald-600 text-sm"
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

/* ---- UI helpers ---- */
function Field({ label, description, children }) {
  return (
    <div className="space-y-2">
      <Label className="text-lg font-semibold leading-7">{label}</Label>
      {description && <p className="text-base text-slate-600 leading-7">{description}</p>}
      {children}
    </div>
  );
}

function Lift({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl bg-white
          border-2 border-indigo-200
          px-3 py-2
          transition-colors
          group-focus-within:border-indigo-400
          group-focus-within:ring-2 group-focus-within:ring-indigo-500/30 ${className}`}
    >
      <div className="rounded-[14px] bg-white/95 border border-white/60 px-3 py-2 group-focus-within:shadow-[0_10px_30px_rgba(2,6,23,0.08)]">
        {children}
      </div>
    </div>
  );
}
