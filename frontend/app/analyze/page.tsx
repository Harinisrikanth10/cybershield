"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Globe,
  MessageSquare,
  Eye,
  Mic,
  Video,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Info,
  Upload,
  RefreshCw,
  FileText,
  Copy,
  Check,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { RiskMeter } from "@/components/risk-meter";
import { api } from "@/lib/api";
import { AnalysisResponse } from "@/types";
import { getRiskBadgeClasses, formatDateTime } from "@/lib/utils";

type TabType = "url" | "text" | "image" | "audio" | "video";

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabType) || "url";

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [copied, setCopied] = useState(false);

  // Form states
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [contextType, setContextType] = useState("email");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setError(null);
    setResult(null);
  };

  const clearForm = () => {
    setUrlInput("");
    setTextInput("");
    setSelectedFile(null);
    setError(null);
    setResult(null);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await api.analyzeUrl(urlInput.trim());
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to analyze URL.");
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await api.analyzeText(textInput.trim(), contextType);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to analyze text.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setError(null);
    setLoading(true);
    try {
      const res = await api.analyzeFile(activeTab as "image" | "audio" | "video", selectedFile);
      setResult(res);
    } catch (err: any) {
      setError(err.message || `Failed to analyze ${activeTab} file.`);
    } finally {
      setLoading(false);
    }
  };

  const copySummary = () => {
    if (!result) return;
    const summary = `CyberShield AI Report [${result.id}]
Target: ${result.target_summary}
Risk Score: ${result.risk_score}/100 (${result.risk_category} Risk)
Confidence: ${Math.round(result.confidence_score * 100)}%
Findings: ${result.findings.map((f) => f.title).join(", ") || "None"}
Status: ${result.status}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Sidebar>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-cyber-text tracking-tight flex items-center gap-2">
            <span>Threat Analysis Center</span>
          </h1>
          <p className="text-xs text-cyber-muted mt-1">
            Submit suspicious URLs, messages, or forensic media files for multi-vector threat inspection.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-cyber-sidebar border border-cyber-border overflow-x-auto">
          <button
            onClick={() => handleTabChange("url")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "url"
                ? "bg-cyber-card text-cyber-cyan border border-cyber-cyan/40 shadow-sm"
                : "text-cyber-muted hover:text-cyber-text"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>URL / Web Link</span>
          </button>

          <button
            onClick={() => handleTabChange("text")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "text"
                ? "bg-cyber-card text-cyber-cyan border border-cyber-cyan/40 shadow-sm"
                : "text-cyber-muted hover:text-cyber-text"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Text / Email / SMS</span>
          </button>

          <button
            onClick={() => handleTabChange("image")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "image"
                ? "bg-cyber-card text-cyber-cyan border border-cyber-cyan/40 shadow-sm"
                : "text-cyber-muted hover:text-cyber-text"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Image Forensics</span>
          </button>

          <button
            onClick={() => handleTabChange("audio")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "audio"
                ? "bg-cyber-card text-cyber-cyan border border-cyber-cyan/40 shadow-sm"
                : "text-cyber-muted hover:text-cyber-text"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Audio & Voice</span>
          </button>

          <button
            onClick={() => handleTabChange("video")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "video"
                ? "bg-cyber-card text-cyber-cyan border border-cyber-cyan/40 shadow-sm"
                : "text-cyber-muted hover:text-cyber-text"
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video & Deepfakes</span>
          </button>
        </div>

        {/* Input Card */}
        <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border shadow-xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400">
              <AlertOctagon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. URL Analysis Tab */}
          {activeTab === "url" && (
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-cyber-muted mb-1.5">
                  Target Website URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-cyber-muted absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/login"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-cyber-sidebar border border-cyber-border text-sm text-cyber-text placeholder:text-cyber-muted/50 focus:outline-none focus:border-cyber-cyan transition-colors"
                  />
                </div>
              </div>

              {/* Sample test buttons */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-cyber-muted">
                <span>Quick Test Samples:</span>
                <button
                  type="button"
                  onClick={() => setUrlInput("https://login.paypal.com.account-update.xyz/verify")}
                  className="px-2 py-1 rounded bg-cyber-sidebar border border-cyber-border hover:border-cyber-cyan text-cyber-cyan"
                >
                  Spoofed PayPal Subdomain
                </button>
                <button
                  type="button"
                  onClick={() => setUrlInput("http://192.168.1.1/admin-panel")}
                  className="px-2 py-1 rounded bg-cyber-sidebar border border-cyber-border hover:border-cyber-cyan text-cyber-cyan"
                >
                  Private RFC1918 (SSRF Block)
                </button>
                <button
                  type="button"
                  onClick={() => setUrlInput("https://www.apple.com/support")}
                  className="px-2 py-1 rounded bg-cyber-sidebar border border-cyber-border hover:border-cyber-cyan text-cyber-cyan"
                >
                  Legitimate Official Site
                </button>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || !urlInput.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-cyber-dark bg-cyber-cyan hover:bg-cyan-400 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                  <span>{loading ? "Inspecting URL..." : "Analyze URL"}</span>
                </button>
                <button
                  type="button"
                  onClick={clearForm}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-cyber-muted hover:text-cyber-text bg-cyber-sidebar border border-cyber-border"
                >
                  Clear
                </button>
              </div>
            </form>
          )}

          {/* 2. Text Analysis Tab */}
          {activeTab === "text" && (
            <form onSubmit={handleTextSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-cyber-muted">
                  Suspicious Message / Email Body
                </label>
                <select
                  value={contextType}
                  onChange={(e) => setContextType(e.target.value)}
                  className="bg-cyber-sidebar border border-cyber-border rounded-lg px-2.5 py-1 text-xs text-cyber-text focus:outline-none focus:border-cyber-cyan"
                >
                  <option value="email">Email Message</option>
                  <option value="sms">SMS / Smishing</option>
                  <option value="invoice">Invoice / Financial</option>
                  <option value="social">Social Media DM</option>
                </select>
              </div>

              <textarea
                required
                rows={5}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste the email headers, body text, or SMS message here..."
                className="w-full p-3.5 rounded-xl bg-cyber-sidebar border border-cyber-border text-sm text-cyber-text placeholder:text-cyber-muted/50 focus:outline-none focus:border-cyber-cyan transition-colors"
              />

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-cyber-muted">
                <span>Quick Test Samples:</span>
                <button
                  type="button"
                  onClick={() =>
                    setTextInput(
                      "URGENT: Your Chase bank account has been locked due to suspicious activity. Reply immediately with your online password and one-time code to restore access or account will be terminated in 2 hours."
                    )
                  }
                  className="px-2 py-1 rounded bg-cyber-sidebar border border-cyber-border hover:border-cyber-cyan text-cyber-cyan"
                >
                  Bank OTP Scam
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTextInput(
                      "Attention: A court summons has been issued by the police. Do not contact anyone. Wire $3,500 via Bitcoin immediately to resolve this matter."
                    )
                  }
                  className="px-2 py-1 rounded bg-cyber-sidebar border border-cyber-border hover:border-cyber-cyan text-cyber-cyan"
                >
                  Authority Coercion
                </button>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || !textInput.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-cyber-dark bg-cyber-cyan hover:bg-cyan-400 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                  <span>{loading ? "Analyzing Text..." : "Inspect Message"}</span>
                </button>
                <button
                  type="button"
                  onClick={clearForm}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-cyber-muted hover:text-cyber-text bg-cyber-sidebar border border-cyber-border"
                >
                  Clear
                </button>
              </div>
            </form>
          )}

          {/* 3, 4, 5. File Upload Tabs (Image, Audio, Video) */}
          {(activeTab === "image" || activeTab === "audio" || activeTab === "video") && (
            <form onSubmit={handleFileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-cyber-muted mb-1.5">
                  Upload {activeTab.toUpperCase()} File for Forensic Inspection
                </label>
                <div className="p-8 border-2 border-dashed border-cyber-border hover:border-cyber-cyan/50 rounded-2xl bg-cyber-sidebar/50 text-center transition-colors">
                  <input
                    type="file"
                    id="fileUpload"
                    required
                    accept={
                      activeTab === "image"
                        ? "image/jpeg,image/png,image/webp"
                        : activeTab === "audio"
                        ? "audio/wav,audio/mp3,audio/mpeg,audio/x-m4a"
                        : "video/mp4,video/webm"
                    }
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-10 h-10 text-cyber-cyan mb-2" />
                    <span className="text-sm font-semibold text-cyber-text">
                      {selectedFile ? selectedFile.name : `Choose a ${activeTab} file or drag it here`}
                    </span>
                    <span className="text-xs text-cyber-muted mt-1">
                      {activeTab === "image" && "Supported: JPEG, PNG, WebP (Max 10 MB)"}
                      {activeTab === "audio" && "Supported: WAV, MP3, M4A (Max 25 MB)"}
                      {activeTab === "video" && "Supported: MP4, WebM (Max 50 MB, 8 sampled frames)"}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || !selectedFile}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-cyber-dark bg-cyber-cyan hover:bg-cyan-400 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                  <span>{loading ? `Analyzing ${activeTab}...` : `Run ${activeTab} Inspection`}</span>
                </button>
                <button
                  type="button"
                  onClick={clearForm}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-cyber-muted hover:text-cyber-text bg-cyber-sidebar border border-cyber-border"
                >
                  Clear
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Live Analysis Result Section */}
        {result && (
          <div className="p-6 sm:p-8 rounded-2xl bg-cyber-card border border-cyber-border space-y-6">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-cyber-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-sidebar border border-cyber-border text-cyber-cyan uppercase">
                    {result.submission_type}
                  </span>
                  <span className="text-xs text-cyber-muted font-mono">{formatDateTime(result.created_at)}</span>
                </div>
                <h3 className="text-lg font-bold text-cyber-text mt-1 max-w-xl truncate">
                  {result.target_summary}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copySummary}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyber-sidebar border border-cyber-border hover:border-cyber-cyan text-cyber-text transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy Summary"}</span>
                </button>
                <Link
                  href={`/reports/${result.id}`}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyber-cyan hover:bg-cyan-400 text-cyber-dark transition-all"
                >
                  <span>Full Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Gauge & Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-1 flex justify-center p-4 rounded-xl bg-cyber-sidebar/50 border border-cyber-border">
                <RiskMeter
                  score={result.risk_score}
                  category={result.risk_category}
                  confidence={result.confidence_score}
                  size="md"
                />
              </div>

              <div className="md:col-span-2 space-y-3">
                <h4 className="text-sm font-bold text-cyber-text">Threat Evaluation Summary</h4>
                <p className="text-xs text-cyber-muted leading-relaxed">
                  CyberShield assessed this artifact using {result.model_info?.engine || "heuristic models"}.
                  {result.risk_score >= 50
                    ? " Multiple high-severity indicators were identified, suggesting strong probability of compromise or phishing."
                    : " No critical exploitation indicators were identified, though routine verification remains recommended."}
                </p>

                {/* Model Limitations notice */}
                {result.limitations.length > 0 && (
                  <div className="p-3 rounded-lg bg-cyber-sidebar border border-cyber-border text-[11px] text-cyber-muted space-y-1">
                    <span className="font-semibold text-cyber-cyan">Limitations & Scope:</span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {result.limitations.map((lim, idx) => (
                        <li key={idx}>{lim}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Key Findings List */}
            <div>
              <h4 className="text-xs font-bold text-cyber-text uppercase tracking-wider mb-3">
                Detected Indicators ({result.findings.length})
              </h4>
              {result.findings.length > 0 ? (
                <div className="space-y-2.5">
                  {result.findings.map((f) => {
                    const badge = getRiskBadgeClasses(f.severity);
                    return (
                      <div
                        key={f.id}
                        className="p-3.5 rounded-xl bg-cyber-sidebar border border-cyber-border flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-cyber-text">{f.title}</h5>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border uppercase ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {f.severity}
                            </span>
                          </div>
                          <p className="text-xs text-cyber-muted mt-1">{f.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-cyber-sidebar border border-cyber-border text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>No active threat indicators detected during inspection.</span>
                </div>
              )}
            </div>

            {/* Recommended Next Steps */}
            <div>
              <h4 className="text-xs font-bold text-cyber-text uppercase tracking-wider mb-3">
                Actionable Defense Steps
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-cyber-sidebar border border-cyber-border">
                    <span className="text-[10px] font-semibold text-cyber-cyan uppercase">{rec.priority}</span>
                    <h5 className="text-xs font-bold text-cyber-text mt-0.5">{rec.action}</h5>
                    <p className="text-[11px] text-cyber-muted mt-1">{rec.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
}

export default function AnalyzePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-cyber-dark flex items-center justify-center text-cyber-muted text-sm">
          Loading CyberShield Threat Inspector...
        </div>
      }
    >
      <AnalyzeContent />
    </React.Suspense>
  );
}

