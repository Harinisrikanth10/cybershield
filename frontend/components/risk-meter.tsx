"use client";

import React from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle, AlertOctagon } from "lucide-react";
import { getRiskBadgeClasses } from "@/lib/utils";

interface RiskMeterProps {
  score: number;
  category: "Low" | "Moderate" | "High" | "Critical" | string;
  confidence?: number;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
}

export function RiskMeter({
  score,
  category,
  confidence = 0.85,
  size = "md",
  showDetails = true,
}: RiskMeterProps) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const badgeClasses = getRiskBadgeClasses(category);

  // SVG Gauge calculations
  const strokeWidth = size === "lg" ? 10 : size === "md" ? 8 : 6;
  const radius = size === "lg" ? 68 : size === "md" ? 52 : 38;
  const circumference = 2 * Math.PI * radius;
  // Semi-circle or 240 degree gauge
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * clampedScore) / 100;

  const getMeterColor = () => {
    switch (category.toLowerCase()) {
      case "critical":
        return "#EF4444";
      case "high":
        return "#F97316";
      case "moderate":
      case "medium":
        return "#F59E0B";
      case "low":
      default:
        return "#10B981";
    }
  };

  const getCategoryIcon = () => {
    switch (category.toLowerCase()) {
      case "critical":
        return <AlertOctagon className="w-4 h-4 text-red-400" />;
      case "high":
        return <ShieldAlert className="w-4 h-4 text-orange-400" />;
      case "moderate":
      case "medium":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "low":
      default:
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
    }
  };

  const dimension = radius * 2 + strokeWidth * 2 + 10;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative flex items-center justify-center" style={{ width: dimension, height: dimension }}>
        <svg
          width={dimension}
          height={dimension}
          viewBox={`0 0 ${dimension} ${dimension}`}
          className="transform -rotate-135"
        >
          {/* Background Arc */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke="#14243A"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Progress Arc */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke={getMeterColor()}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Central Score Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-mono font-bold tracking-tight ${
              size === "lg" ? "text-4xl" : size === "md" ? "text-2xl" : "text-lg"
            } text-cyber-text`}
          >
            {clampedScore}
          </span>
          <span className="text-[10px] uppercase font-semibold text-cyber-muted -mt-0.5 tracking-wider">
            Risk Index
          </span>
        </div>
      </div>

      {showDetails && (
        <div className="mt-2 flex flex-col items-center gap-1.5">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badgeClasses.bg} ${badgeClasses.text} ${badgeClasses.border}`}
          >
            {getCategoryIcon()}
            <span>{category} Risk</span>
          </div>

          <div className="text-[11px] text-cyber-muted flex items-center gap-1">
            <span>Confidence:</span>
            <span className="font-semibold text-cyber-text">{Math.round(confidence * 100)}%</span>
            <span className="text-cyber-muted/60">(calibrated)</span>
          </div>
        </div>
      )}
    </div>
  );
}
