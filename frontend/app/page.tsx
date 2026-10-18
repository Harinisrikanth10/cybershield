"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Globe,
  Eye,
  Mic,
  MessageSquare,
  BarChart3,
  Bot,
  ArrowRight,
  CheckCircle2,
  Lock,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Logo } from "@/components/logo";
import { RiskMeter } from "@/components/risk-meter";

export default function LandingPage() {
  const features = [
    {
      icon: Globe,
      title: "Phishing & URL Analysis",
      description: "Dissect deceptive subdomains, suspicious TLDs, redirect masking, and homograph tricks with strict SSRF defense.",
      href: "/analyze?tab=url",
      badge: "Zero-Click Safe",
    },
    {
      icon: Eye,
      title: "Deepfake Risk Assessment",
      description: "Inspect spatial visual artifacts, compression stepping, and camera provenance markers on suspect images and video.",
      href: "/analyze?tab=image",
      badge: "Media Forensics",
    },
    {
      icon: Mic,
      title: "Audio & Voice-Cloning Indicators",
      description: "Identify synthetic vocoder frequencies and robotic prosody often used in CEO impersonation and emergency family scams.",
      href: "/analyze?tab=audio",
      badge: "Vishing Defense",
    },
    {
      icon: MessageSquare,
      title: "Digital Impersonation Analysis",
      description: "Scan emails, SMS, and invoices for credential harvesting, urgent wire transfer patterns, and coercive psychological lures.",
      href: "/analyze?tab=text",
      badge: "Social Engineering",
    },
    {
      icon: BarChart3,
      title: "Explainable Risk Scoring",
      description: "Every 0–100 score is transparently backed by deduplicated evidence, explicit model limits, and confidence calibration.",
      href: "/dashboard",
      badge: "No Black-Box",
    },
    {
      icon: Bot,
      title: "Security Education Assistant",
      description: "Consult our interactive AI cybersecurity mentor to break down suspicious reports and learn safe defensive habits.",
      href: "/assistant",
      badge: "Interactive Mentor",
    },
  ];

  return (
    <div className="min-h-screen bg-cyber-dark text-cyber-text flex flex-col selection:bg-cyber-cyan selection:text-cyber-dark">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden cyber-grid-pattern border-b border-cyber-border/60">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-dark/80 to-cyber-dark pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Top subtle pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-card border border-cyber-cyan/30 text-xs font-medium text-cyber-cyan mb-8 glow-cyan">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CyberShield AI 2026 Threat Intelligence Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Your Digital World. <br />
            <span className="bg-gradient-to-r from-cyber-cyan via-sky-400 to-blue-500 bg-clip-text text-transparent">
              Protected by AI.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-cyber-muted max-w-2xl mx-auto font-normal leading-relaxed">
            Detect suspicious messages, investigate deceptive phishing URLs, inspect AI-manipulated media, and understand cybersecurity risks with transparent, explainable scoring.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/analyze"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm bg-cyber-cyan hover:bg-cyan-400 text-cyber-dark transition-all duration-200 shadow-[0_0_25px_rgba(34,211,238,0.35)]"
            >
              <span>Analyze a Threat</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm bg-cyber-card hover:bg-cyber-elevated border border-cyber-border text-cyber-text transition-all duration-200"
            >
              <span>Explore Dashboard</span>
            </Link>
          </div>

          {/* Interactive Live Product Dashboard Preview Mock */}
          <div className="mt-16 sm:mt-20 max-w-5xl mx-auto rounded-2xl border border-cyber-border bg-cyber-sidebar/80 p-2 sm:p-4 shadow-2xl backdrop-blur-xl relative">
            <div className="flex items-center justify-between pb-3 px-3 border-b border-cyber-border/80">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-xs font-mono text-cyber-muted">console.cybershield.ai/threat-center</span>
              </div>
              <div className="text-[11px] text-cyber-cyan font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
                <span>ENGINE ACTIVE</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 text-left">
              {/* Card 1: Risk Gauge */}
              <div className="p-5 rounded-xl bg-cyber-card border border-cyber-border flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-cyber-muted uppercase tracking-wider">
                    Recent Target Evaluation
                  </span>
                  <h4 className="text-sm font-semibold text-cyber-text mt-1 truncate">
                    paypal.com.secure-update.top
                  </h4>
                </div>
                <div className="my-3">
                  <RiskMeter score={92} category="Critical" confidence={0.95} size="sm" />
                </div>
                <div className="text-xs text-red-400 font-medium bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
                  Deceptive subdomain brand impersonation flagged.
                </div>
              </div>

              {/* Card 2: Threat Indicators Breakdown */}
              <div className="p-5 rounded-xl bg-cyber-card border border-cyber-border flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-cyber-muted uppercase tracking-wider">
                    Identified Signals
                  </span>
                  <h4 className="text-sm font-semibold text-cyber-text mt-1">Multi-Vector Indicators</h4>
                </div>
                <div className="space-y-2.5 my-3">
                  <div className="flex items-center justify-between text-xs p-2 rounded bg-cyber-dark border border-cyber-border">
                    <span className="text-cyber-text font-medium">Domain Spoofing</span>
                    <span className="text-red-400 font-bold">+42 pts</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2 rounded bg-cyber-dark border border-cyber-border">
                    <span className="text-cyber-text font-medium">Suspicious TLD (.top)</span>
                    <span className="text-amber-400 font-bold">+25 pts</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2 rounded bg-cyber-dark border border-cyber-border">
                    <span className="text-cyber-text font-medium">Auth Path Tokens</span>
                    <span className="text-amber-400 font-bold">+20 pts</span>
                  </div>
                </div>
                <div className="text-[11px] text-cyber-muted">Signals de-duplicated to prevent double counting.</div>
              </div>

              {/* Card 3: Defense Actions */}
              <div className="p-5 rounded-xl bg-cyber-card border border-cyber-border flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-cyber-muted uppercase tracking-wider">
                    Recommended Actions
                  </span>
                  <h4 className="text-sm font-semibold text-cyber-text mt-1">Actionable Defense</h4>
                </div>
                <div className="space-y-2.5 my-3">
                  <div className="flex items-start gap-2 text-xs text-cyber-text">
                    <CheckCircle2 className="w-4 h-4 text-cyber-cyan flex-shrink-0 mt-0.5" />
                    <span>Never enter bank login or debit card credentials.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-cyber-text">
                    <CheckCircle2 className="w-4 h-4 text-cyber-cyan flex-shrink-0 mt-0.5" />
                    <span>Report host to registrar for domain takedown.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-cyber-text">
                    <CheckCircle2 className="w-4 h-4 text-cyber-cyan flex-shrink-0 mt-0.5" />
                    <span>Verify communications via official contact channels.</span>
                  </div>
                </div>
                <Link
                  href="/analyze"
                  className="w-full text-center py-2 text-xs font-semibold rounded-lg bg-cyber-elevated border border-cyber-border hover:border-cyber-cyan text-cyber-cyan transition-colors"
                >
                  Run Live Analysis &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-20 bg-cyber-sidebar/40 border-b border-cyber-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs uppercase tracking-widest text-cyber-cyan font-bold">Comprehensive Capabilities</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-cyber-text">
              Multi-Vector Threat Detection Built for Everyone
            </p>
            <p className="mt-4 text-sm sm:text-base text-cyber-muted">
              CyberShield AI combines lexical heuristic parsing, media forensic checks, and interactive AI guidance to safeguard your digital footprint.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <Link
                  key={idx}
                  href={feat.href}
                  className="group p-6 rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/50 hover:bg-cyber-elevated/80 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-cyber-sidebar border border-cyber-border group-hover:border-cyber-cyan/50 flex items-center justify-center text-cyber-cyan transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-cyber-cyan bg-cyber-dark/80 px-2 py-1 rounded border border-cyber-cyan/30">
                        {feat.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-cyber-text group-hover:text-cyber-cyan transition-colors">
                      {feat.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-cyber-muted leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-cyber-cyan">
                    <span>Inspect feature</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 border-b border-cyber-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs uppercase tracking-widest text-cyber-cyan font-bold">How It Works</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-cyber-text">
              Three Steps from Suspicion to Safety
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border relative">
              <div className="text-3xl font-mono font-extrabold text-cyber-cyan/40 mb-3">01</div>
              <h3 className="text-lg font-bold text-cyber-text">Submit Digital Artifact</h3>
              <p className="mt-2 text-xs sm:text-sm text-cyber-muted">
                Paste a suspicious message, input a URL, or upload an image, audio clip, or video recording. All uploads are validated for safety and size limits.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border relative">
              <div className="text-3xl font-mono font-extrabold text-cyber-cyan/40 mb-3">02</div>
              <h3 className="text-lg font-bold text-cyber-text">Multi-Vector Inspection</h3>
              <p className="mt-2 text-xs sm:text-sm text-cyber-muted">
                Our engine parses structural, lexical, and forensic features. Strict SSRF protections ensure internal networks and cloud metadata endpoints are protected.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border relative">
              <div className="text-3xl font-mono font-extrabold text-cyber-cyan/40 mb-3">03</div>
              <h3 className="text-lg font-bold text-cyber-text">Transparent Report & Defense</h3>
              <p className="mt-2 text-xs sm:text-sm text-cyber-muted">
                Receive an explainable 0–100 risk score, itemized evidence, explicit model limitations, and prioritized verification steps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy and Responsible AI Section */}
      <section id="security" className="py-20 bg-cyber-sidebar/40 border-b border-cyber-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-cyber-card border border-cyber-border flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyber-cyan uppercase tracking-wider mb-2">
                <Lock className="w-3.5 h-3.5" />
                <span>Privacy & Responsible AI Principles</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-cyber-text">
                Security Without Surveillance
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-cyber-muted leading-relaxed">
                CyberShield AI does not retain raw user media indefinitely. We do not automatically visit arbitrary internal URLs or execute untrusted JavaScript. Most importantly, we avoid false confidence: our risk engine explicitly reports model limitations and separates observed facts from inferred threat judgments.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-cyber-text">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyber-cyan" />
                  <span>Strict SSRF Defense</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyber-cyan" />
                  <span>Transparent Confidence Calibration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyber-cyan" />
                  <span>Right to Erasure & Data Export</span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <Link
                href="/learn"
                className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-cyber-cyan text-cyber-dark hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(34,211,238,0.25)]"
              >
                Visit Security Academy
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-cyber-border bg-cyber-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Logo variant="horizontal" href="/" showTagline />
          <p className="text-xs text-cyber-muted">
            &copy; {new Date().getFullYear()} CyberShield AI. Intelligent Threat Detection & Digital Safety Platform.
          </p>
          <div className="flex items-center gap-6 text-xs text-cyber-muted font-medium">
            <Link href="/learn" className="hover:text-cyber-cyan transition-colors">Academy</Link>
            <Link href="/assistant" className="hover:text-cyber-cyan transition-colors">Assistant</Link>
            <Link href="/dashboard" className="hover:text-cyber-cyan transition-colors">Console</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
