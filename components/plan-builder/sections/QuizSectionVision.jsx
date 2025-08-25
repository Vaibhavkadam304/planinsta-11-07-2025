"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Sparkles, ChevronLeft, CheckCircle2 } from "lucide-react";
import SuggestedChoices from "@/components/SuggestedChoices";

export default function QuizSectionVision({
  currentSection = 2,
  totalSections = 11,
  defaultValues = {},
  onSubmit,
  onPrevious,
}) {
  const [values, setValues] = useState({
    visionStatement: defaultValues.visionStatement || "",
    shortTermGoal: defaultValues.shortTermGoal || "",
    longTermGoal: defaultValues.longTermGoal || "",
  });

  const oneLiner = String(defaultValues.description || "");
  const businessModel = String(defaultValues.businessModel || "");
  const stage = String(defaultValues.businessStage || "");

  useEffect(() => {
    document.body.classList.add("glass-bg");
    return () => document.body.classList.remove("glass-bg");
  }, []);

  const [submitted, setSubmitted] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const percent = useMemo(
    () => Math.round((currentSection / Math.max(1, totalSections)) * 100),
    [currentSection, totalSections]
  );

  const valid = !!values.visionStatement.trim();

  function handleSubmit(e) {
    e?.preventDefault?.();
    setSubmitted(true);
    if (!valid) return;
    onSubmit?.(values);
  }

  return (
    <div className="relative min-h-[100dvh] flex items-start justify-center overflow-hidden">
      <AuroraBG theme="sunset" />

      <div className="w-full max-w-5xl px-4 md:px-6 pt-8 pb-24">
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

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative rounded-2xl shadow-sm bg-white p-6 md:p-8"
        >
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

          <header className="text-center space-y-3 mb-6">
            <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-500" />
            <motion.h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Vision &amp; Goals
            </motion.h1>
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-indigo-600">
              Define your business vision and strategic objectives
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Long-term vision (required) */}
            <Field
              label="What's your long-term vision?"
              required
              description="Describe where you see your business in 5–10 years"
            >
              <Lift>
                <Textarea
                  value={values.visionStatement}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, visionStatement: e.target.value }))
                  }
                  onFocus={() => setActiveField("visionStatement")}
                  placeholder="e.g., To become the leading AI automation platform for small businesses globally"
                  className="min-h-[110px] text-xl leading-7 bg-transparent border-0 outline-none focus-visible:ring-0 focus-visible:outline-none"
                />
              </Lift>

              <SuggestedChoices
                oneLiner={oneLiner}
                businessModel={businessModel}
                stage={stage}
                target="longTermVision"
                active={activeField === "visionStatement"}
                onPick={(text) =>
                  setValues((v) => ({ ...v, visionStatement: text }))
                }
                className="mt-2"
              />

              {submitted && !values.visionStatement.trim() && (
                <div className="text-sm text-rose-600">Please add your vision</div>
              )}
            </Field>

            {/* Next 6–12 months (optional) */}
            <Field
              label="What's your main goal for the next 6–12 months? (optional)"
              description="Your immediate priority or milestone"
            >
              <Lift>
                <Textarea
                  value={values.shortTermGoal}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, shortTermGoal: e.target.value }))
                  }
                  onFocus={() => setActiveField("shortTermGoal")}
                  placeholder="e.g., Launch our MVP and acquire 100 paying customers"
                  className="min-h-[110px] text-xl leading-7 bg-transparent border-0 outline-none focus-visible:ring-0 focus-visible:outline-none"
                />
              </Lift>

              <SuggestedChoices
                oneLiner={oneLiner}
                businessModel={businessModel}
                stage={stage}
                target="next12moGoal"
                active={activeField === "shortTermGoal"}
                onPick={(text) =>
                  setValues((v) => ({ ...v, shortTermGoal: text }))
                }
                className="mt-2"
              />
            </Field>

            {/* 3–5 years (optional) */}
            <Field
              label="What's your goal for the next 3–5 years? (optional)"
              description="Your medium-term strategic objective"
            >
              <Lift>
                <Textarea
                  value={values.longTermGoal}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, longTermGoal: e.target.value }))
                  }
                  onFocus={() => setActiveField("longTermGoal")}
                  placeholder="e.g., Expand to 10,000 customers and raise Series A funding"
                  className="min-h-[110px] text-xl leading-7 bg-transparent border-0 outline-none focus-visible:ring-0 focus-visible:outline-none"
                />
              </Lift>

              <SuggestedChoices
                oneLiner={oneLiner}
                businessModel={businessModel}
                stage={stage}
                target="midTermGoal"
                active={activeField === "longTermGoal"}
                onPick={(text) =>
                  setValues((v) => ({ ...v, longTermGoal: text }))
                }
                className="mt-2"
              />
            </Field>

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

              <Button
                size="lg"
                className="
                    rounded-xl px-6 py-2.5
                    bg-white text-slate-900 border border-slate-300
                    hover:bg-orange-600 hover:text-white hover:bg-indigo-700
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2
                    active:scale-[0.98] transition-colors duration-200
                "
                type="submit"
                disabled={!valid && submitted === true}
              >
                Continue
              </Button>
            </div>

            <AnimatePresence>
              {submitted && valid && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-emerald-600 text-sm"
                >
                  <CheckCircle2 className="h-4 w-4" /> Great! Goals saved.
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- Aurora background (performance-tuned) ---------- */
function AuroraBG({ theme = "sunset" }) {
  const reduce = useReducedMotion();
  const palettes = {
    sunset: ["#ffedd5", "#fee2e2", "#eef2ff"],
    indigo: ["#e0e7ff", "#f5f3ff", "#e0f2fe"],
    emerald: ["#dcfce7", "#e0f2fe", "#ede9fe"],
  };
  const [a, b, c] = palettes[theme] || palettes.sunset;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(900px 600px at 0% -10%, ${a}, transparent 60%),
            radial-gradient(1000px 600px at 100% 0%, ${b}, transparent 60%),
            radial-gradient(1200px 800px at 50% 110%, ${c}, transparent 60%),
            linear-gradient(180deg, #ffffff, #f8fafc 50%, #eef2ff)
          `,
        }}
      />
      {!reduce && (
        <motion.div
          className="hidden md:block absolute -inset-40 blur-xl opacity-[0.18] mix-blend-screen will-change-transform transform-gpu"
          style={{
            background:
              "conic-gradient(from 180deg at 50% 50%, #f97316, #ef4444, #8b5cf6, #06b6d4, #f97316)",
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        />
      )}
    </div>
  );
}

/* --------------------------- Layout helpers --------------------------- */
function Field({ label, description, required, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <div className="space-y-2">
        <div className="flex items-end gap-2">
          <Label className="text-lg font-semibold leading-7">
            {label} {required && <span className="text-rose-600">*</span>}
          </Label>
        </div>
        {description && (
          <p className="text-base text-slate-600 leading-7">{description}</p>
        )}
        {children}
      </div>
    </motion.div>
  );
}

function FieldHint({ show, children }) {
  if (!show) return null;
  return <div className="text-sm text-rose-600">{children}</div>;
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
