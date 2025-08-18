// components/SuggestedChoices.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { suggestChoices } from "@/app/actions/suggest-choices";

type Props = {
  oneLiner: string;
  businessModel: string;
  stage: string;
  target: "longTermVision" | "next12moGoal" | "midTermGoal";
  onPick: (text: string) => void;
  className?: string;
  /** Fetch once when this becomes true (driven by textarea focus). */
  active?: boolean;
};

export default function SuggestedChoices({
  oneLiner,
  businessModel,
  stage,
  target,
  onPick,
  className = "",
  active = false,
}: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const loadedOnceRef = useRef(false);

  useEffect(() => {
    if (!active) return;
    if (loadedOnceRef.current) return; // only once per focus lifecycle
    loadedOnceRef.current = true;

    setLoading(true);
    suggestChoices({ oneLiner, businessModel, stage, target, count: 4 })
      .then((res: any) => setSuggestions(res?.suggestions || []))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div className={`mt-2 ${className}`}>
      {loading && <span className="text-xs text-gray-500">Generating suggestions…</span>}
      {!loading && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onPick(s)}
              className="text-left text-sm rounded-2xl border px-3 py-1 hover:bg-gray-50"
              title="Click to use this"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
