"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Switch } from "@/components/ui/switch";
import { Sparkles, ChevronLeft, CheckCircle2 } from "lucide-react";

const CHANNELS = [
  "SEO",
  "Ads",
  "Social Media",
  "Email Marketing",
  "Referrals",
  "Content Marketing",
  "Partnerships",
];

const PRICING = ["Free", "Subscription", "One-time Payment", "Freemium"];

export default function QuizSectionMarketing({
  currentSection = 5,
  totalSections = 11,
  defaultValues = {},
  onSubmit,
  onPrevious,
}) {
  const [channels, setChannels] = useState(
    Array.isArray(defaultValues.marketingChannels)
      ? defaultValues.marketingChannels
      : []
  );
  const [pricing, setPricing] = useState(defaultValues.pricingStrategy || "");
  const [hasSalesTeam, setHasSalesTeam] = useState(
    !!defaultValues.hasSalesTeam
  );

  useEffect(() => {
    document.body.classList.remove("glass-bg");
  }, []);

  const percent = useMemo(
    () => Math.round((currentSection / Math.max(1, totalSections)) * 100),
    [currentSection, totalSections]
  );

  const [submitted, setSubmitted] = useState(false);

  const toggleChannel = (c) =>
    setChannels((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    setSubmitted(true);

    const submitter = e?.nativeEvent?.submitter;
    const isContinue = submitter && submitter.id === "continueBtn";
    if (!isContinue) return;

    onSubmit?.({
      marketingChannels: channels,
      pricingStrategy: pricing,
      hasSalesTeam,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") e.preventDefault();
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
              Marketing &amp; Sales
            </h1>
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-indigo-600">
              Define your customer acquisition and sales strategy
            </p>
          </header>

          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-8">
            {/* Channels */}
            <Field
              label="Which marketing channels will you use?"
              hint="Select all channels you plan to use for customer acquisition"
            >
              <div className="flex flex-wrap gap-3">
                {CHANNELS.map((c) => {
                  const on = channels.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleChannel(c)}
                      className={[
                        "rounded-full px-5 py-3 text-lg leading-7 border transition-all",
                        on
                          ? "text-white border-transparent bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-500 shadow"
                          : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200",
                      ].join(" ")}
                      aria-pressed={on}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </Field>

            {/* Pricing */}
            <Field
              label="What's your pricing strategy?"
              hint="How do you plan to charge customers?"
            >
              <Lift>
                <Select value={pricing} onValueChange={setPricing}>
                  <SelectTrigger className="h-12 text-lg leading-7 bg-transparent border-0 outline-none focus-visible:ring-0 focus-visible:outline-none">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64 bg-white border shadow-md rounded-xl">
                    {PRICING.map((p) => (
                      <SelectItem
                        key={p}
                        value={p}
                        className="bg-white text-slate-800 focus:bg-slate-100 hover:bg-slate-50 rounded-lg"
                      >
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Lift>
            </Field>

            {/* Sales team */}
            <Field
              label="Do you have a dedicated sales team?"
              hint="Will you have people focused specifically on sales?"
            >
              <Lift>
                <div className="flex items-center gap-4 px-2 py-2">
                  <Switch
                    checked={hasSalesTeam}
                    onCheckedChange={setHasSalesTeam}
                    className="data-[state=checked]:bg-indigo-600 data-[state=unchecked]:bg-slate-300"
                  />
                  <span className="text-lg leading-7 text-slate-700">
                    {hasSalesTeam ? "Yes" : "No"}
                  </span>
                </div>
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
                  <CheckCircle2 className="h-4 w-4" /> Saved. You can adjust later if needed.
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

/* --------------------------- UI helpers --------------------------- */
function Field({ label, hint, children }) {
  return (
    <div className="space-y-2">
      <Label className="text-lg font-semibold leading-7">{label}</Label>
      {hint && <p className="text-base text-slate-600 leading-7">{hint}</p>}
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
