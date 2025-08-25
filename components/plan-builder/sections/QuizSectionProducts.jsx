"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Sparkles, ChevronLeft, Plus, Minus, Trash2, CheckCircle2 } from "lucide-react";

export default function QuizSectionProducts({
  currentSection = 4,
  totalSections = 11,
  defaultValues = {},
  onSubmit,
  onPrevious,
}) {
  const [products, setProducts] = useState(
    Array.isArray(defaultValues.products) && defaultValues.products.length
      ? defaultValues.products.map((p) => ({
          name: p?.name || "",
          features: Array.isArray(p?.features) ? p.features : [""],
          uniqueSellingPoint: p?.uniqueSellingPoint || "",
        }))
      : [{ name: "", features: [""], uniqueSellingPoint: "" }]
  );

  useEffect(() => {
    document.body.classList.add("glass-bg");
    return () => document.body.classList.remove("glass-bg");
  }, []);

  const percent = useMemo(
    () => Math.round((currentSection / Math.max(1, totalSections)) * 100),
    [currentSection, totalSections]
  );

  const [submitted, setSubmitted] = useState(false);
  const valid = products.length > 0 && products.every((p) => (p.name || "").trim().length > 0);

  const updateProductField = (i, key, value) =>
    setProducts((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [key]: value };
      return next;
    });

  const updateFeature = (pi, fi, value) =>
    setProducts((prev) => {
      const next = [...prev];
      const feats = [...(next[pi].features || [])];
      feats[fi] = value;
      next[pi].features = feats;
      return next;
    });

  const addFeature = (pi) =>
    setProducts((prev) => {
      const next = [...prev];
      next[pi].features = [...(next[pi].features || []), ""];
      return next;
    });

  const removeFeature = (pi, fi) =>
    setProducts((prev) => {
      const next = [...prev];
      const feats = [...(next[pi].features || [])];
      feats.splice(fi, 1);
      next[pi].features = feats.length ? feats : [""];
      return next;
    });

  const addProduct = () =>
    setProducts((prev) => [...prev, { name: "", features: [""], uniqueSellingPoint: "" }]);

  const removeProduct = (i) =>
    setProducts((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    setSubmitted(true);

    const submitter = e?.nativeEvent?.submitter;
    const isContinue = submitter && submitter.id === "continueBtn";
    if (!isContinue) return;

    if (!valid) return;
    onSubmit?.({ products });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.target?.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex items-start justify-center overflow-hidden">
      <AuroraBG theme="sunset" />
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
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Products
            </h1>
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-indigo-600">
              Add each product’s name, features, and what makes it unique.
            </p>
          </header>

          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-8">
            {products.map((p, idx) => (
              <div key={idx} className="rounded-2xl bg-white/70 p-4 md:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-lg">Product {idx + 1}</h4>
                  {products.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => removeProduct(idx)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>

                <Field label="What’s your product called?">
                  <Lift>
                    <Input
                      value={p.name}
                      onChange={(e) => updateProductField(idx, "name", e.target.value)}
                      placeholder="WorkflowAI Platform"
                      className="h-12 text-lg leading-7 bg-transparent border-0 outline-none focus-visible:ring-0 focus-visible:outline-none"
                    />
                  </Lift>
                  {submitted && !p.name.trim() && (
                    <div className="text-sm text-rose-600">Product name is required</div>
                  )}
                </Field>

                <Field label="Key features">
                  {p.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 mt-2 w-full">
                      <Lift className="flex-1 min-w-0">
                        <Input
                          value={feat}
                          onChange={(e) => updateFeature(idx, fIdx, e.target.value)}
                          placeholder="e.g., Automated task scheduling"
                          className="h-12 text-lg leading-7 bg-transparent border-0 outline-none focus-visible:ring-0 focus-visible:outline-none w-full"
                        />
                      </Lift>
                      {(p.features?.length ?? 0) > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl shrink-0"
                          onClick={() => removeFeature(idx, fIdx)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 rounded-xl"
                    onClick={() => addFeature(idx)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add feature
                  </Button>
                </Field>

                <Field label="What makes it unique?">
                  <Lift>
                    <Textarea
                      value={p.uniqueSellingPoint}
                      onChange={(e) =>
                        updateProductField(idx, "uniqueSellingPoint", e.target.value)
                      }
                      placeholder="Learns from user behaviour…"
                      className="min-h-[110px] text-xl leading-7 bg-transparent border-0 outline-none focus-visible:ring-0 focus-visible:outline-none"
                    />
                  </Lift>
                </Field>
              </div>
            ))}

            <Button type="button" variant="outline" className="rounded-xl" onClick={addProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Add another product
            </Button>

            <div className="pt-4 flex items-center justify-between">
              <Button type="button" variant="outline" onClick={onPrevious} className="rounded-xl px-6">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Section
              </Button>
              <Button
                id="continueBtn"
                type="submit"
                className="
                    rounded-xl px-6 py-2.5
                    bg-white text-slate-900 border border-slate-300
                    hover:bg-orange-600 hover:text-white hover:bg-indigo-700
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2
                    active:scale-[0.98] transition-colors duration-200
                "
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
                  <CheckCircle2 className="h-4 w-4" /> Looks good! Products saved.
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
      {/* Static mesh */}
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
function Field({ label, children }) {
  return (
    <div className="mt-4">
      <Label className="text-lg font-semibold leading-7">{label}</Label>
      <div className="mt-2 space-y-2">{children}</div>
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
