"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Sparkles, ChevronLeft, Minus, Plus, CheckCircle2 } from "lucide-react";

const LEGAL_OPTIONS = [
  "Sole Proprietorship",
  "Partnership",
  "LLP",
  "Private Limited",
  "Other",
];

export default function QuizSectionLegalOwnership({
  currentSection = 7,
  totalSections = 11,
  defaultValues = {},
  onSubmit,
  onPrevious,
}) {
  const [legalStructure, setLegalStructure] = useState(
    defaultValues.legalStructure || ""
  );
  const [incorporationCountry, setIncorpCountry] = useState(
    defaultValues.incorporationCountry || ""
  );
  const [incorporationState, setIncorpState] = useState(
    defaultValues.incorporationState || ""
  );

  const [owners, setOwners] = useState(
    Array.isArray(defaultValues.ownership) && defaultValues.ownership.length
      ? defaultValues.ownership
      : [{ name: "", role: "", ownershipPercent: undefined }]
  );

  const [founders, setFounders] = useState(
    Array.isArray(defaultValues.founders) && defaultValues.founders.length
      ? defaultValues.founders
      : [{ name: "", title: "", bio: "", linkedinUrl: "" }]
  );

  useEffect(() => {
    document.body.classList.remove("glass-bg");
  }, []);

  const percent = useMemo(
    () => Math.round((currentSection / Math.max(1, totalSections)) * 100),
    [currentSection, totalSections]
  );

  const totalPct = owners.reduce(
    (s, o) => s + (Number(o.ownershipPercent) || 0),
    0
  );
  const anyPct = owners.some(
    (o) =>
      o.ownershipPercent !== undefined &&
      o.ownershipPercent !== null &&
      String(o.ownershipPercent) !== ""
  );
  const pctError = anyPct && Math.abs(totalPct - 100) > 0.5;

  const canContinue =
    legalStructure.trim() &&
    incorporationCountry.trim() &&
    incorporationState.trim() &&
    !pctError;

  const [submitted, setSubmitted] = useState(false);

  const addOwner = () =>
    setOwners((o) => [...o, { name: "", role: "", ownershipPercent: undefined }]);
  const removeOwner = (i) =>
    setOwners((o) => (o.length > 1 ? o.filter((_, idx) => idx !== i) : o));
  const updateOwner = (i, key, val) =>
    setOwners((o) => {
      const n = [...o];
      n[i] = {
        ...n[i],
        [key]:
          key === "ownershipPercent"
            ? val === ""
              ? undefined
              : Number(val)
            : val,
      };
      return n;
    });

  const addFounder = () =>
    setFounders((f) => [
      ...f,
      { name: "", title: "", bio: "", linkedinUrl: "" },
    ]);
  const removeFounder = (i) =>
    setFounders((f) => (f.length > 1 ? f.filter((_, idx) => idx !== i) : f));
  const updateFounder = (i, key, val) =>
    setFounders((f) => {
      const n = [...f];
      n[i] = { ...n[i], [key]: val };
      return n;
    });

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    setSubmitted(true);

    const submitter = e?.nativeEvent?.submitter;
    const isContinue = submitter && submitter.id === "continueBtn";
    if (!isContinue) return;

    if (!canContinue) return;
    onSubmit?.({
      legalStructure,
      incorporationCountry,
      incorporationState,
      ownership: owners,
      founders,
    });
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

        {/* Solid card */}
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
              Legal Structure &amp; Ownership
            </h1>
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-indigo-600">
              Capture your registration details, owners, and founders
            </p>
          </header>

          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-8">
            {/* Legal structure */}
            <Field
              label="What’s your legal structure?"
              hint="Select the legal entity type"
              required
              error={submitted && !legalStructure ? "Please select a legal structure" : ""}
            >
              <Lift>
                <Select value={legalStructure} onValueChange={setLegalStructure}>
                  <SelectTrigger className="h-12 text-lg leading-7 bg-transparent border-0 outline-none focus-visible:ring-0 focus-visible:outline-none">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64 bg-white border shadow-md rounded-xl">
                    {LEGAL_OPTIONS.map((o) => (
                      <SelectItem
                        key={o}
                        value={o}
                        className="bg-white text-slate-800 focus:bg-slate-100 hover:bg-slate-50 rounded-lg"
                      >
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Lift>
            </Field>

            {/* Country */}
            <Field
              label="Country of Incorporation"
              hint="Where is the company legally registered?"
              required
              error={submitted && !incorporationCountry ? "Please enter a country" : ""}
            >
              <Lift>
                <Input
                  value={incorporationCountry}
                  onChange={(e) => setIncorpCountry(e.target.value)}
                  placeholder="e.g., India"
                  className="h-12 text-lg leading-7 bg-transparent border-0 outline-none focus-visible:ring-0 focus-visible:outline-none"
                />
              </Lift>
            </Field>

            {/* State */}
            <Field
              label="State/Province of Incorporation"
              hint="The state or province of registration"
              required
              error={submitted && !incorporationState ? "Please enter a state" : ""}
            >
              <Lift>
                <Input
                  value={incorporationState}
                  onChange={(e) => setIncorpState(e.target.value)}
                  placeholder="e.g., Maharashtra"
                  className="h-12 text-lg leading-7 bg-transparent border-0 outline-none focus-visible:ring-0 focus-visible:outline-none"
                />
              </Lift>
            </Field>

            {/* Ownership */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold leading-7">Ownership</Label>
              <p className="text-base text-slate-600 leading-7">
                Add owners with their role and (optionally) equity %
              </p>

              <div className="space-y-3">
                {owners.map((o, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <Lift className="md:col-span-4">
                        <Input
                          className="h-12 text-lg leading-7 bg-transparent border-0 focus-visible:ring-0"
                          placeholder="Owner name"
                          value={o.name}
                          onChange={(e) => updateOwner(idx, "name", e.target.value)}
                        />
                      </Lift>
                      <Lift className="md:col-span-6">
                        <Input
                          className="h-12 text-lg leading-7 bg-transparent border-0 focus-visible:ring-0"
                          placeholder="Role / Title"
                          value={o.role}
                          onChange={(e) => updateOwner(idx, "role", e.target.value)}
                        />
                      </Lift>
                      <Lift className="md:col-span-2">
                        <Input
                          className="h-12 text-lg leading-7 bg-transparent border-0 focus-visible:ring-0 text-right"
                          placeholder="%"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={o.ownershipPercent ?? ""}
                          onChange={(e) =>
                            updateOwner(idx, "ownershipPercent", e.target.value)
                          }
                        />
                      </Lift>
                    </div>

                    {owners.length > 1 && (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => removeOwner(idx)}
                        >
                          <Minus className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={addOwner}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Owner
              </Button>

              <div className={`text-sm ${pctError ? "text-rose-600" : "text-slate-500"}`}>
                {pctError
                  ? `Ownership percentages must total 100%. Current total: ${
                      Number.isFinite(totalPct) ? totalPct : 0
                    }%`
                  : `If you provide equity %, the total must equal 100%. Current total: ${
                      Number.isFinite(totalPct) ? totalPct : 0
                    }%`}
              </div>
            </div>

            {/* Founding Team */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold leading-7">Founding Team</Label>
              <p className="text-base text-slate-600 leading-7">
                Add founders (Name, Title, optional Bio, optional LinkedIn URL)
              </p>

              <div className="space-y-4">
                {founders.map((f, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <Lift className="md:col-span-4">
                        <Input
                          className="h-12 text-lg leading-7 bg-transparent border-0 focus-visible:ring-0"
                          placeholder="Founder name"
                          value={f.name}
                          onChange={(e) => updateFounder(idx, "name", e.target.value)}
                        />
                      </Lift>
                      <Lift className="md:col-span-4">
                        <Input
                          className="h-12 text-lg leading-7 bg-transparent border-0 focus-visible:ring-0"
                          placeholder="Title (e.g., Co-Founder & CTO)"
                          value={f.title}
                          onChange={(e) => updateFounder(idx, "title", e.target.value)}
                        />
                      </Lift>
                      <Lift className="md:col-span-4">
                        <Input
                          className="h-12 text-lg leading-7 bg-transparent border-0 focus-visible:ring-0"
                          placeholder="LinkedIn URL (optional)"
                          value={f.linkedinUrl || ""}
                          onChange={(e) => updateFounder(idx, "linkedinUrl", e.target.value)}
                        />
                      </Lift>
                    </div>

                    <Lift>
                      <Textarea
                        className="w-full text-lg leading-7 bg-transparent border-0 focus-visible:ring-0"
                        placeholder="Short bio (optional)"
                        rows={3}
                        value={f.bio || ""}
                        onChange={(e) => updateFounder(idx, "bio", e.target.value)}
                      />
                    </Lift>

                    {founders.length > 1 && (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => removeFounder(idx)}
                        >
                          <Minus className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={addFounder}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Founder
              </Button>
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

/* --------------------------- UI helpers --------------------------- */
function Field({ label, hint, required, error, children }) {
  return (
    <div className="space-y-2">
      <Label className="text-lg font-semibold leading-7">
        {label} {required && <span className="text-indigo-600">*</span>}
      </Label>
      {hint && <p className="text-base text-slate-600 leading-7">{hint}</p>}
      {children}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

function Lift({ children, className = "" }) {
  return (
    <div className={`group relative rounded-2xl ${className}`}>
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
