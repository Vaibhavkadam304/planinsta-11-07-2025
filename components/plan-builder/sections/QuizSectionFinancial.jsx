"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, ChevronLeft, Sparkles, CheckCircle2 } from "lucide-react";

/**
 * Financial Information (styled like your other new pages)
 *
 * Props:
 * - currentSection, totalSections
 * - defaultValues: {
 *     initialInvestment, investmentUtilization: [{item,amount}],
 *     fundingReceived, fundingNeeded, fundingUseBreakdown: [{item,amount}],
 *     monthlyRevenue, monthlyExpenses
 *   }
 * - onPrevious: () => void
 * - onSubmit: (vals) => void
 */
export default function QuizSectionFinancial({
  currentSection = 9,
  totalSections = 11,
  defaultValues = {},
  onPrevious,
  onSubmit,
}) {
  const [val, setVal] = useState({
    initialInvestment:
      defaultValues.initialInvestment || "",
    investmentUtilization:
      Array.isArray(defaultValues.investmentUtilization) && defaultValues.investmentUtilization.length
        ? defaultValues.investmentUtilization
        : [{ item: "", amount: "" }],
    fundingReceived:
      defaultValues.fundingReceived || "",
    fundingNeeded:
      defaultValues.fundingNeeded || "",
    fundingUseBreakdown:
      Array.isArray(defaultValues.fundingUseBreakdown) && defaultValues.fundingUseBreakdown.length
        ? defaultValues.fundingUseBreakdown
        : [{ item: "", amount: "" }],
    monthlyRevenue:
      defaultValues.monthlyRevenue || "",
    monthlyExpenses:
      defaultValues.monthlyExpenses || "",
  });

  // keep background simple (no glass on this one)
  useEffect(() => {
    document.body.classList.remove("glass-bg");
  }, []);

  const percent = useMemo(
    () => Math.round((currentSection / Math.max(1, totalSections)) * 100),
    [currentSection, totalSections]
  );

  const [submitted, setSubmitted] = useState(false);

  // helpers
  const setField = (k) => (eOrV) =>
    setVal((v) => ({ ...v, [k]: eOrV?.target ? eOrV.target.value : eOrV }));

  const addKV = (k) =>
    setVal((v) => ({ ...v, [k]: [...v[k], { item: "", amount: "" }] }));

  const removeKV = (k, i) =>
    setVal((v) => {
      const next = [...v[k]];
      if (next.length > 1) next.splice(i, 1);
      return { ...v, [k]: next };
    });

  const setKV = (k, i, field, value) =>
    setVal((v) => {
      const next = [...v[k]];
      next[i] = { ...next[i], [field]: value };
      return { ...v, [k]: next };
    });

  // Only advance when Continue is clicked; block Enter-to-submit
  const handleSubmit = (e) => {
    e?.preventDefault?.();
    setSubmitted(true);
    const submitter = e?.nativeEvent?.submitter;
    const isContinue = submitter && submitter.id === "continueBtn";
    if (!isContinue) return;
    onSubmit?.(val);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") e.preventDefault();
  };

  return (
    <div className="relative min-h-[100dvh] flex items-start justify-center overflow-hidden">
      <div className="w-full max-w-5xl px-4 md:px-6 pt-8 pb-24">
        {/* sticky top bar (lighter on mobile, blur on md+) */}
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

        {/* card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative rounded-2xl shadow-sm bg-white p-6 md:p-8"
        >
          {/* corner badge to match other sections */}
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

          {/* header */}
          <header className="text-center space-y-3 mb-6">
            <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-500" />
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Financial Information
            </h1>
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-indigo-600">
              Provide details about your financial situation and projections
            </p>
          </header>

          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-8">
            {/* Initial investment */}
            <Field
              label="How much initial investment have you made?"
              description="The amount you've invested to start the business"
            >
              <Lift>
                <Input
                  value={val.initialInvestment}
                  onChange={setField("initialInvestment")}
                  placeholder="e.g., $50,000"
                  className="h-12 text-lg leading-7 bg-transparent border-0 focus-visible:ring-0"
                />
              </Lift>
            </Field>

            {/* Investment utilization (KV) */}
            <Field
              label="How did you use your initial investment?"
              description="Break down how you spent your startup capital"
            >
              <div className="space-y-3">
                {val.investmentUtilization.map((row, i) => (
                  <div key={`iu-${i}`} className="grid grid-cols-12 gap-3">
                    <div className="col-span-9">
                      <Lift>
                        <Input
                          value={row.item}
                          onChange={(e) => setKV("investmentUtilization", i, "item", e.target.value)}
                          placeholder="e.g., Marketing, Development"
                          className="h-12 text-lg leading-7 bg-transparent border-0 focus-visible:ring-0"
                        />
                      </Lift>
                    </div>
                    <div className="col-span-3">
                      <Lift>
                        <Input
                          value={row.amount}
                          onChange={(e) => setKV("investmentUtilization", i, "amount", e.target.value)}
                          placeholder="Amount"
                          className="h-12 text-lg leading-7 bg-transparent border-0 focus-visible:ring-0"
                        />
                      </Lift>
                    </div>
                    {val.investmentUtilization.length > 1 && (
                      <div className="col-span-12 -mt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => removeKV("investmentUtilization", i)}
                        >
                          <Minus className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => addKV("investmentUtilization")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </Field>

            {/* External funding received */}
            <Field
              label="Have you received any external funding?"
              description="Any investment from outside sources"
            >
              <Lift>
                <Select value={val.fundingReceived} onValueChange={setField("fundingReceived")}>
                  <SelectTrigger className="h-12 text-lg leading-7 bg-transparent border-0 focus-visible:ring-0">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64 bg-white border shadow-md rounded-xl">
                    {["None", "Bootstrapped", "Angel Investment", "VC Funding"].map((o) => (
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

            {/* Funding needed */}
            <Field
              label="How much funding do you need?"
              description="Amount of additional funding required"
            >
              <Lift>
                <Input
                  value={val.fundingNeeded}
                  onChange={setField("fundingNeeded")}
                  placeholder="e.g., $100,000"
                  className="h-12 text-lg leading-7 bg-transparent border-0 focus-visible:ring-0"
                />
              </Lift>
            </Field>

            {/* Funding use breakdown (KV) */}
            <Field
              label="How will you use the new funding?"
              description="Break down how you'll spend the additional funding"
            >
              <div className="space-y-3">
                {val.fundingUseBreakdown.map((row, i) => (
                  <div key={`fb-${i}`} className="grid grid-cols-12 gap-3">
                    <div className="col-span-9">
                      <Lift>
                        <Input
                          value={row.item}
                          onChange={(e) => setKV("fundingUseBreakdown", i, "item", e.target.value)}
                          placeholder="e.g., Product Development, Marketing"
                          className="h-12 text-lg leading-7 bg-transparent border-0 focus-visible:ring-0"
                        />
                      </Lift>
                    </div>
                    <div className="col-span-3">
                      <Lift>
                        <Input
                          value={row.amount}
                          onChange={(e) => setKV("fundingUseBreakdown", i, "amount", e.target.value)}
                          placeholder="Amount"
                          className="h-12 text-lg leading-7 bg-transparent border-0 focus-visible:ring-0"
                        />
                      </Lift>
                    </div>
                    {val.fundingUseBreakdown.length > 1 && (
                      <div className="col-span-12 -mt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => removeKV("fundingUseBreakdown", i)}
                        >
                          <Minus className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => addKV("fundingUseBreakdown")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </Field>

            {/* Revenue & Expenses */}
            <div className="grid md:grid-cols-2 gap-6">
              <Field
                label="What's your current monthly revenue?"
                description="Your current monthly income from the business"
              >
                <Lift>
                  <Input
                    value={val.monthlyRevenue}
                    onChange={setField("monthlyRevenue")}
                    placeholder="e.g., $10,000"
                    className="h-12 text-lg leading-7 bg-transparent border-0 focus-visible:ring-0"
                  />
                </Lift>
              </Field>

              <Field
                label="What are your current monthly expenses?"
                description="Your current monthly business costs"
              >
                <Lift>
                  <Input
                    value={val.monthlyExpenses}
                    onChange={setField("monthlyExpenses")}
                    placeholder="e.g., $5,000"
                    className="h-12 text-lg leading-7 bg-transparent border-0 focus-visible:ring-0"
                  />
                </Lift>
              </Field>
            </div>

            {/* nav */}
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

/* --------- small UI helpers to match your other styled pages --------- */
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
