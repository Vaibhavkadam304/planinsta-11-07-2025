"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wand2, Sparkles, CheckCircle2 } from "lucide-react";

/**
 * Section 1 (Business Basics) — performance-tuned:
 * - Animated tint is desktop-only and lighter (less blur/opacity, slower)
 * - Sticky bar blur only on md+ screens
 * - Keeps your current solid card (no heavy backdrop filters)
 */
export default function QuizSection1({
  currentSection = 1,
  totalSections = 11,
  defaultValues = {},
  onSubmit,
}) {
  const [values, setValues] = useState({
    businessName: defaultValues.businessName || "",
    oneLiner: defaultValues.oneLiner || "",
    model: defaultValues.model || "",
    stage: defaultValues.stage || "",
  });

  useEffect(() => {
    document.body.classList.add("glass-bg");
    return () => document.body.classList.remove("glass-bg");
  }, []);

  const [submitted, setSubmitted] = useState(false);

  const percent = useMemo(
    () => Math.round((currentSection / Math.max(1, totalSections)) * 100),
    [currentSection, totalSections]
  );

  const valid =
    values.businessName.trim() &&
    values.oneLiner.trim() &&
    values.model &&
    values.stage;

  function handleChange(key) {
    return (e) =>
      setValues((v) => ({ ...v, [key]: e?.target ? e.target.value : e }));
  }

  function handleSubmit(e) {
    e?.preventDefault?.();
    setSubmitted(true);
    if (!valid) return;
    onSubmit?.(values);
  }

  return (
    <div className="relative min-h-[100dvh] flex items-start justify-center overflow-hidden">
      {/* Gorgeous, performant background */}
      <AuroraBG theme="sunset" />

      <div className="w-full max-w-5xl px-4 md:px-6 pt-8 pb-20">
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

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          //className="relative rounded-2xl border shadow-sm bg-white p-6 md:p-8"
          className="relative rounded-2xl shadow-sm bg-white p-6 md:p-8"
          // Solid white is cheaper than glass/blur surfaces
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

          {/* Header with gradient accent */}
          <header className="text-center space-y-3 mb-6">
            <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-500" />
            <motion.h1
              layoutId="quiz-title"
              className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-slate-900"
            >
              Business Basics
            </motion.h1>
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-indigo-600">
              Let's start with the fundamentals of your business
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Field
              label="What's your business name?"
              required
              description="Enter the official name of your business or startup"
            >
              <Lift>
                <Input
                  value={values.businessName}
                  onChange={handleChange("businessName")}
                  placeholder="e.g., TechFlow Solutions"
                  className="h-12 text-lg leading-7 bg-transparent border-0 outline-none focus-visible:ring-0 focus-visible:outline-none"
                />
              </Lift>
              <FieldHint show={submitted && !values.businessName}>
                Please enter a name
              </FieldHint>
            </Field>

            <Field
              label="Describe your business in one sentence"
              required
              description="A compelling one-liner that explains what your business does"
            >
              <Lift>
                <Textarea
                  value={values.oneLiner}
                  onChange={handleChange("oneLiner")}
                  placeholder="e.g., We help small businesses automate their workflow processes through AI-powered solutions"
                  className="min-h-[110px] text-lg leading-7 bg-transparent border-0 outline-none focus-visible:ring-0 focus-visible:outline-none"
                />
              </Lift>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                <span>
                  {
                    values.oneLiner
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean).length
                  }{" "}
                  words
                </span>
                <span>Keep it short & powerful</span>
              </div>
              <FieldHint show={submitted && !values.oneLiner}>
                Please add a one-liner
              </FieldHint>
            </Field>

            <div className="grid md:grid-cols-2 gap-6">
              <Field label="What's your business model?" required>
                <Lift>
                  <Select value={values.model} onValueChange={handleChange("model")}>
                    {/* trigger shows gradient frame; menu is solid white */}
                    <SelectTrigger className="h-12 text-lg leading-7 bg-transparent border-0 outline-none focus-visible:ring-0 focus-visible:outline-none">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64 bg-white border shadow-md rounded-xl">
                      {BUSINESS_MODELS.map((m) => (
                        <SelectItem
                          key={m}
                          value={m}
                          className="text-base bg-white text-slate-800 focus:bg-slate-100 hover:bg-slate-50 rounded-lg"

                        >
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Lift>
                <FieldHint show={submitted && !values.model}>
                  Please select a model
                </FieldHint>
              </Field>

              <Field label="What stage is your business currently in?" required>
                <Lift>
                  <Select value={values.stage} onValueChange={handleChange("stage")}>
                    <SelectTrigger className="h-12 text-lg leading-7 bg-transparent border-0 outline-none focus-visible:ring-0 focus-visible:outline-none">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64 bg-white border shadow-md rounded-xl">
                      {BUSINESS_STAGES.map((m) => (
                        <SelectItem
                          key={m}
                          value={m}
                          className="text-base bg-white text-slate-800 focus:bg-slate-100 hover:bg-slate-50 rounded-lg"
                        >
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Lift>
                <FieldHint show={submitted && !values.stage}>
                  Please select your stage
                </FieldHint>
              </Field>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-slate-500 text-sm">
                <Wand2 className="h-4 w-4" />
                Tip: You can refine this later; this just guides the AI.
              </div>
              <Button
                size="lg"
                type="submit"
                disabled={!valid && submitted === true}
                className="
                  rounded-xl px-6 py-2.5
                  bg-white text-slate-900 border border-slate-300
                  hover:bg-orange-500 hover:text-white hover:bg-indigo-700
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2
                  active:scale-[0.98] transition-colors duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  disabled:hover:bg-white disabled:hover:text-slate-900 disabled:hover:border-slate-300
                "
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
                  <CheckCircle2 className="h-4 w-4" /> Great! We'll use this to
                  tailor your plan.
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- Aurora background (mesh + optional animated conic tint) ---------- */
function AuroraBG({ theme = "sunset" }) {
  const reduce = useReducedMotion();

  // Pick a palette; swap these to your brand if you want.
  const palettes = {
    sunset: ["#ffedd5", "#fee2e2", "#eef2ff"], // warm peach, soft red, indigo-tint
    indigo: ["#e0e7ff", "#f5f3ff", "#e0f2fe"], // indigo, violet, sky
    emerald: ["#dcfce7", "#e0f2fe", "#ede9fe"], // green, cyan, lilac
  };
  const [a, b, c] = palettes[theme] || palettes.sunset;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      {/* Static mesh (0 CPU) */}
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
      {/* Ultra-light animated tint (GPU transforms only) */}
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
        {description && <p className="text-base text-slate-600 leading-6">{description}</p>}
        {children}
      </div>
    </motion.div>
  );
}

function FieldHint({ show, children }) {
  if (!show) return null;
  return <div className="text-sm text-rose-600">{children}</div>;
}

/* Gradient “frame” wrapper for inputs/selects/textarea */
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

/* Options */
const BUSINESS_MODELS = [
  "SaaS",
  "Marketplace",
  "E-commerce",
  "Freemium / Usage-based",
  "Agency / Services",
  "Licensing / OEM",
  "Franchise",
];

const BUSINESS_STAGES = [
  "Idea / Research",
  "MVP in progress",
  "Pre-revenue",
  "Early revenue",
  "Scaling",
  "Profitable",
];
