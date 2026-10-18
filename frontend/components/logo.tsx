"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  variant?: "full" | "compact" | "horizontal";
  className?: string;
  href?: string;
  showTagline?: boolean;
}

export function Logo({
  variant = "horizontal",
  className = "",
  href = "/",
  showTagline = false,
}: LogoProps) {
  const ShieldIcon = ({ size = 36 }: { size?: number }) => (
    <div
      className="relative flex items-center justify-center transition-transform duration-300 hover:scale-105"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B1628" />
            <stop offset="100%" stopColor="#07111F" />
          </linearGradient>
          <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
          <linearGradient id="accentCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>

        {/* Shield Body */}
        <path
          d="M50 8 L85 22 V50 C85 71 69 87 50 93 C31 87 15 71 15 50 V22 Z"
          fill="url(#shieldGrad)"
          stroke="url(#borderGrad)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Inner Border */}
        <path
          d="M50 14 L79 26 V49 C79 67 66 81 50 86 C34 81 21 67 21 49 V26 Z"
          fill="none"
          stroke="#23364F"
          strokeWidth="1.5"
        />

        {/* Neural Network Traces */}
        <line x1="50" y1="23" x2="50" y2="41" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="2 2" />
        <line x1="32" y1="36" x2="45" y2="48" stroke="#22D3EE" strokeWidth="1.5" opacity="0.85" />
        <line x1="68" y1="36" x2="55" y2="48" stroke="#22D3EE" strokeWidth="1.5" opacity="0.85" />
        <line x1="33" y1="62" x2="44" y2="58" stroke="#3B82F6" strokeWidth="1.5" opacity="0.85" />
        <line x1="67" y1="62" x2="56" y2="58" stroke="#3B82F6" strokeWidth="1.5" opacity="0.85" />

        {/* Neural Nodes */}
        <circle cx="50" cy="23" r="3" fill="#22D3EE" className="animate-pulse" />
        <circle cx="32" cy="36" r="2.5" fill="#3B82F6" />
        <circle cx="68" cy="36" r="2.5" fill="#3B82F6" />
        <circle cx="33" cy="62" r="2.5" fill="#22D3EE" />
        <circle cx="67" cy="62" r="2.5" fill="#22D3EE" />

        {/* Protected Hexagonal Core */}
        <polygon
          points="50,42 60,48 60,60 50,66 40,60 40,48"
          fill="#0B1628"
          stroke="url(#accentCyan)"
          strokeWidth="2"
        />

        {/* Verification Checkmark */}
        <path
          d="M45 54 L48.5 57.5 L55.5 49.5"
          fill="none"
          stroke="#F8FAFC"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );

  const content = (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {variant === "compact" && (
        <div className="flex items-center gap-2">
          <ShieldIcon size={34} />
          <span className="sr-only">CyberShield AI</span>
        </div>
      )}

      {variant === "horizontal" && (
        <div className="flex items-center gap-2.5">
          <ShieldIcon size={36} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-cyber-text">
                Cyber<span className="text-cyber-cyan">Shield</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyber-cyan bg-cyber-elevated border border-cyber-cyan/40 rounded">
                AI
              </span>
            </div>
            {showTagline && (
              <span className="text-[10px] uppercase tracking-widest text-cyber-muted -mt-0.5 font-medium">
                Intelligent Defense
              </span>
            )}
          </div>
        </div>
      )}

      {variant === "full" && (
        <div className="flex flex-col items-center text-center p-3">
          <ShieldIcon size={64} />
          <div className="mt-3 flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-cyber-text">
              Cyber<span className="text-cyber-cyan">Shield</span>
            </span>
            <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-cyber-cyan bg-cyber-elevated border border-cyber-cyan/40 rounded">
              AI
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-cyber-muted tracking-wide">
            Intelligent Threat Detection & Digital Safety
          </p>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}
