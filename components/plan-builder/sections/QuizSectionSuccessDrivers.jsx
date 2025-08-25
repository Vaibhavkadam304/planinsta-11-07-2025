"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2, Plus, Minus, ChevronLeft, Sparkles, CheckCircle2 } from "lucide-react";
import { suggestSwot } from "@/app/actions/suggest-swot";

/**
 * Success Drivers & Weakness page (matches the new quiz styling)
 *
 * Props:
 * - currentSection (number)
 * - totalSections (number)
 * - defaultValues: { successDrivers?: string[]; weaknesses?: string[] }
 * - data: the full quiz `data` object (used to generate suggestions)
 * - onPrevious: () => void
 * - onSubmit: (vals) => void
 */
export default function QuizSectionSuccessDrivers({
  currentSection = 8,
  totalSections = 11,
  defaultValues = {},
  data,
  onPrevious,
  onSubmit,
}) {
  const [successDrivers, setSuccessDrivers] = useState(
    Array.isArray(defaultValues.successDrivers) && defaultValues.successDrivers.length
      ? defaultValues.successDrivers
      : [""]
  );
  const [weaknesses, setWeaknesses] = useState(
    Array.isArray(defaultValues.weaknesses) && defaultValues.weaknesses.length
      ? defaultValues.weaknesses
      : [""]
  );

  const [swotLoading, setSwotLoading] = useState(false);
  const [sugg, setSugg] = useState({ strengths: [], weaknesses: [] });

  // keep background simple here (no full-page canvas)
  useEffect(() => {
    document.body.classList.remove("glass-bg");
  }, []);

  // Load suggestions when the user enters this page (once)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setSwotLoading(true);
        const res = await suggestSwot({ data });
        if (!mounted) return;
        setSugg({
          strengths: Array.isArray(res?.strengths) ? res.strengths.slice(0, 5) : [],
          weaknesses: Array.isArray(res?.weaknesses) ? res.weaknesses.slice(0, 5) : [],
        });
      } catch {
        /* ignore */
      } finally {
        if (mounted) setSwotLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [data]);

  const percent = useMemo(
    () => Math.round((currentSection / Math.max(1, totalSections)) * 100),
    [currentSection, totalSections]
  );

  // Require only the first entry
  const canContinue =
    (successDrivers[0] ?? "").trim().length > 0 &&
    (weaknesses[0] ?? "").trim().length > 0;

  const [submitted, setSubmitted] = useState(false);

  function addRow(kind) {
    kind === "s"
      ? setSuccessDrivers((arr) => [...arr, ""])
      : setWeaknesses((arr) => [...arr, ""]);
  }
  function removeRow(kind, i) {
    kind === "s"
      ? setSuccessDrivers((arr) => (arr.length > 1 ? arr.filter((_, idx) => idx !== i) : arr))
      : setWeaknesses((arr) => (arr.length > 1 ? arr.filter((_, idx) => idx !== i) : arr));
  }
  function updateRow(kind, i, v) {
    if (kind === "s") {
      setSuccessDrivers((arr) => {
        const n = [...arr];
        n[i] = v;
        return n;
      });
    } else {
      setWeaknesses((arr) => {
        const n = [...arr];
        n[i] = v;
        return n;
      });
    }
  }

  async function regenerate() {
    try {
      setSwotLoading(true);
      const res = await suggestSwot({ data });
      setSugg({
        strengths: Array.isArray(res?.strengths) ? res.strengths.slice(0, 5) : [],
        weaknesses: Array.isArray(res?.weaknesses) ? res.weaknesses.slice(0, 5) : [],
      });
    } catch {
      /* ignore */
    } finally {
      setSwotLoading(false);
    }
  }

  function applySuggestion(kind, text) {
    if (kind === "s") {
      setSuccessDrivers((arr) => {
        const n = [...arr];
        const firstEmpty = n.findIndex((v) => !v?.trim());
        if (firstEmpty >= 0) n[firstEmpty] = text;
        else n[0] = text;
        return n;
      });
    } else {
      setWeaknesses((arr) => {
        const n = [...arr];
        const firstEmpty = n.findIndex((v) => !v?.trim());
        if (firstEmpty >= 0) n[firstEmpty] = text;
        else n[0] = text;
        return n;
      });
    }
  }

  // Only advance when Continue is clicked
  function handleSubmit(e) {
    e?.preventDefault?.();
    setSubmitted(true);

    const submitter = e?.nativeEvent?.submitter;
    const isContinue = submitter && submitter.id === "continueBtn";
    if (!isContinue) return;

    if (!canContinue) return;
    onSubmit?.({ successDrivers, weaknesses });
  }

  // Block Enter-to-submit from inputs
  function handleKeyDown(e) {
    if (e.key === "Enter") e.preventDefault();
  }

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

        {/* Solid card (cheaper than glass) */}
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
              Success Drivers
            </h1>
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-indigo-600">
              Success Drivers are the most important things that contribute to the success of a business.
            </p>
          </header>

          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-10">
            {/* Success Drivers */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold leading-7">
                Success Driver 1 (required) <span className="text-rose-600">*</span>
              </Label>
              <p className="text-base text-slate-600 leading-7">
                Success Drivers are the most important things that contribute to the success of a business.
              </p>

              <div className="space-y-3">
                {successDrivers.map((v, i) => (
                  <Lift key={`s-${i}`}>
                    <div className="flex items-center gap-3">
                      <Input
                        className="flex-1 h-12 text-lg leading-7 bg-transparent border-0 focus-visible:ring-0"
                        placeholder={`Success Driver ${i + 1}`}
                        value={v}
                        onChange={(e) => updateRow("s", i, e.target.value)}
                      />
                      {successDrivers.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => removeRow("s", i)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </Lift>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => addRow("s")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>

              {/* Suggestion chips */}
              <div className="pt-2">
                <div className="flex flex-wrap items-center justify-start gap-3">
                  {sugg.strengths.map((s, i) => (
                    <button
                      key={`sgs-${i}`}
                      type="button"
                      className="rounded-full border px-4 py-2 text-base leading-7 shadow-sm hover:bg-gray-50 transition"
                      onClick={() => applySuggestion("s", s)}
                      title="Use suggestion"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex items-center pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl"
                    onClick={regenerate}
                    disabled={swotLoading}
                  >
                    {swotLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Regenerating…
                      </>
                    ) : (
                      "Regenerate Suggestions"
                    )}
                  </Button>
                </div>
              </div>

              {submitted && !(successDrivers[0] ?? "").trim() && (
                <p className="text-sm text-rose-600">Please provide at least one Success Driver.</p>
              )}
            </div>

            {/* Weaknesses */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold leading-7">
                Weakness <span className="text-rose-600">*</span>
              </Label>

              <div className="space-y-3">
                {weaknesses.map((v, i) => (
                  <Lift key={`w-${i}`}>
                    <div className="flex items-center gap-3">
                      <Input
                        className="flex-1 h-12 text-lg leading-7 bg-transparent border-0 focus-visible:ring-0"
                        placeholder={`Weakness ${i + 1}`}
                        value={v}
                        onChange={(e) => updateRow("w", i, e.target.value)}
                      />
                      {weaknesses.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => removeRow("w", i)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </Lift>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => addRow("w")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>

              {/* Suggestion chips */}
              <div className="pt-2">
                <div className="flex flex-wrap items-center justify-start gap-3">
                  {sugg.weaknesses.map((s, i) => (
                    <button
                      key={`sgw-${i}`}
                      type="button"
                      className="rounded-full border px-4 py-2 text-base leading-7 shadow-sm hover:bg-gray-50 transition"
                      onClick={() => applySuggestion("w", s)}
                      title="Use suggestion"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex items-center pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl"
                    onClick={regenerate}
                    disabled={swotLoading}
                  >
                    {swotLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Regenerating…
                      </>
                    ) : (
                      "Regenerate Suggestions"
                    )}
                  </Button>
                </div>
              </div>

              {submitted && !(weaknesses[0] ?? "").trim() && (
                <p className="text-sm text-rose-600">Please provide at least one Weakness.</p>
              )}
            </div>

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
                disabled={!canContinue}
              >
                Continue
              </Button>
            </div>

            <AnimatePresence>
              {submitted && canContinue && (
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

/* ---------- UI helpers (match your other pages) ---------- */
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
