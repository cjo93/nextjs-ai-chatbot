"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SeveritySliderProps {
  value: number;
  onChange: (value: number) => void;
}

const severityLabels = [
  { value: 1, label: "Minor Signal", color: "text-blue-500" },
  { value: 2, label: "Notice", color: "text-blue-600" },
  { value: 3, label: "Friction", color: "text-yellow-500" },
  { value: 4, label: "Tension", color: "text-yellow-600" },
  { value: 5, label: "Challenge", color: "text-orange-500" },
  { value: 6, label: "Breakpoint", color: "text-orange-600" },
  { value: 7, label: "Distortion", color: "text-red-500" },
  { value: 8, label: "Crisis", color: "text-red-600" },
  { value: 9, label: "Anomaly", color: "text-purple-600" },
  { value: 10, label: "Catastrophic", color: "text-purple-700" },
];

export function SeveritySlider({ value, onChange }: SeveritySliderProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const displayValue = hoveredValue ?? value;
  const currentLabel = severityLabels.find((s) => s.value === displayValue);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Severity Level</Label>
        <span className={cn("text-sm font-medium", currentLabel?.color)}>
          {displayValue} - {currentLabel?.label}
        </span>
      </div>

      <div className="relative">
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = x / rect.width;
            const newValue = Math.max(1, Math.min(10, Math.round(percent * 9 + 1)));
            setHoveredValue(newValue);
          }}
          onMouseLeave={() => setHoveredValue(null)}
          className="w-full h-2 bg-gradient-to-r from-blue-500 via-yellow-500 via-orange-500 to-purple-700 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            WebkitAppearance: "none",
          }}
        />
        <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: white;
            border: 2px solid currentColor;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: white;
            border: 2px solid currentColor;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>1 - Signal</span>
        <span>5 - Challenge</span>
        <span>10 - Catastrophic</span>
      </div>
    </div>
  );
}
