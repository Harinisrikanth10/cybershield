"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Copy,
  Trash2,
  Check,
  ShieldAlert,
  AlertTriangle,
  Info,
  Clock,
  Layers,
  Cpu,
  Share2,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { RiskMeter } from "@/components/risk-meter";
import { api } from "@/lib/api";
import { ReportDetailResponse } from "@/types";
import { formatDateTime, getRiskBadgeClasses } from "@/lib/utils";

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [report, setReport] = useState<ReportDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      api
        .getReport(id)
        .then((res) => setReport(res))
        .catch((err) => setError(err.message || "Failed to load report."))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const copySummary = () => {
    if (!report) return;
    const summary = `CyberShield AI Threat Report [ID: ${report.id}]
Target: ${report.target_summary}
Risk Score: ${report.risk_score} / 100 (${report.risk_category} Risk)
Confidence: ${Math.round(report.confidence_score * 100)}%
Analysis Type: ${report.submission_type.toUpperCase()}
Date: ${formatDateTime(report.created_at)}
Key Findings:
${report.findings.map((f) => `- ${f.title}: ${f.description}`).join("\n") || "No critical findings."}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!report) return;
    setDeleting(true);
    try {
      await api.deleteReport(report.id);
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message || "Failed to delete report.");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Sidebar>
        <div className="py-20 text-center text-cyber-muted text-xs">
          <div className="w-8 h-8 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Retrieving cryptographic threat registry record...</span>
        </div>
      </Sidebar>
    );
  }

  if (error || !report) {
    return (
      <Sidebar>
        <div className="p-8 max-w-lg mx-auto text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-lg font-bold text-cyber-text">Report Unavailable</h2>
          <p className="text-xs text-cyber-muted">{error || "Record could not be found."}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-cyber-card border border-cyber-border text-cyber-text hover:border-cyber-cyan"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="space-y-6 max-w-5xl mx-auto print:p-0 print:m-0">
        {/* Top Action Nav Bar (Hidden in Print) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-cyber-border print:hidden">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyber-muted hover:text-cyber-cyan transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={copySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyber-card border border-cyber-border hover:border-cyber-cyan text-cyber-text transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Summary"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyber-card border border-cyber-border hover:border-cyber-cyan text-cyber-text transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Download / Print PDF</span>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-lg text-cyber-muted hover:text-red-400 hover:bg-red-500/10 border border-cyber-border transition-colors"
              title="Delete Report"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-cyber-card border border-cyber-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-cyber-text">Delete Threat Record?</h3>
              <p className="text-xs text-cyber-muted">
                This action will permanently delete this analysis report and associated alert records from your personal database.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyber-sidebar border border-cyber-border text-cyber-text"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-500 hover:bg-red-600 text-white"
                >
                  {deleting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Report Header Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-cyber-card border border-cyber-border shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-cyber-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyber-sidebar border border-cyber-border text-cyber-cyan uppercase">
                  {report.submission_type}
                </span>
                <span className="text-xs font-mono text-cyber-muted">ID: {report.id}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-cyber-text mt-2 max-w-2xl break-all">
                {report.target_summary}
              </h1>
              <p className="text-xs text-cyber-muted mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Recorded on {formatDateTime(report.created_at)}</span>
              </p>
            </div>

            <div className="flex-shrink-0">
              <RiskMeter
                score={report.risk_score}
                category={report.risk_category}
                confidence={report.confidence_score}
                size="lg"
              />
            </div>
          </div>

          {/* Raw Input Preview Snippet */}
          {report.raw_input_preview && (
            <div className="mt-6 p-4 rounded-xl bg-cyber-sidebar border border-cyber-border">
              <span className="text-[10px] uppercase font-bold text-cyber-muted tracking-wider block mb-1">
                Sanitized Raw Input Snippet:
              </span>
              <p className="text-xs font-mono text-cyber-text/90 break-all whitespace-pre-wrap">
                {report.raw_input_preview}
              </p>
            </div>
          )}
        </div>

        {/* Detected Threat Findings */}
        <div className="p-6 sm:p-8 rounded-2xl bg-cyber-card border border-cyber-border space-y-4">
          <h3 className="text-sm font-bold text-cyber-text uppercase tracking-wider">
            Detected Threat Indicators ({report.findings.length})
          </h3>

          {report.findings.length > 0 ? (
            <div className="space-y-3">
              {report.findings.map((f) => {
                const badge = getRiskBadgeClasses(f.severity);
                return (
                  <div
                    key={f.id}
                    className="p-4 rounded-xl bg-cyber-sidebar border border-cyber-border space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-cyber-text">{f.title}</h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {f.severity}
                        </span>
                      </div>
                      <span className="text-[10px] text-cyber-muted font-mono">
                        Confidence: {Math.round(f.confidence * 100)}%
                      </span>
                    </div>
                    <p className="text-xs text-cyber-muted leading-relaxed">{f.description}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-cyber-sidebar border border-cyber-border text-xs text-emerald-400">
              No active compromise indicators identified during this scan.
            </div>
          )}
        </div>

        {/* Factual Observed Evidence Table */}
        <div className="p-6 sm:p-8 rounded-2xl bg-cyber-card border border-cyber-border space-y-4">
          <h3 className="text-sm font-bold text-cyber-text uppercase tracking-wider">
            Factual Observed Evidence ({report.evidence.length})
          </h3>
          <p className="text-xs text-cyber-muted -mt-2">
            Verifiable observations extracted from headers, syntax, and payload bytes.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cyber-sidebar text-cyber-muted font-semibold uppercase tracking-wider border-b border-cyber-border">
                <tr>
                  <th className="py-2.5 px-3">Signal Name</th>
                  <th className="py-2.5 px-3">Observation</th>
                  <th className="py-2.5 px-3">Extracted Value</th>
                  <th className="py-2.5 px-3">Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border">
                {report.evidence.map((ev, idx) => (
                  <tr key={idx} className="hover:bg-cyber-elevated/40">
                    <td className="py-2.5 px-3 font-semibold text-cyber-text">{ev.signal_name}</td>
                    <td className="py-2.5 px-3 text-cyber-muted">{ev.observation}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-cyber-cyan truncate max-w-xs">
                      {ev.raw_value || "N/A"}
                    </td>
                    <td className="py-2.5 px-3 capitalize">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          ev.impact === "negative"
                            ? "bg-red-500/15 text-red-400"
                            : ev.impact === "positive"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-slate-500/15 text-slate-300"
                        }`}
                      >
                        {ev.impact}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommended Defense Actions */}
        <div className="p-6 sm:p-8 rounded-2xl bg-cyber-card border border-cyber-border space-y-4">
          <h3 className="text-sm font-bold text-cyber-text uppercase tracking-wider">
            Recommended Defense Actions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.recommendations.map((rec, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-cyber-sidebar border border-cyber-border">
                <span className="text-[10px] uppercase font-bold text-cyber-cyan">{rec.priority}</span>
                <h4 className="text-xs font-bold text-cyber-text mt-0.5">{rec.action}</h4>
                <p className="text-xs text-cyber-muted mt-1 leading-relaxed">{rec.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Details & Model Limitations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-3">
            <h4 className="text-xs font-bold text-cyber-text uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyber-cyan" />
              <span>Inspection Engine Provenance</span>
            </h4>
            <div className="space-y-1.5 text-xs text-cyber-muted">
              <div className="flex justify-between py-1 border-b border-cyber-border/60">
                <span>Engine:</span>
                <span className="font-semibold text-cyber-text">{report.model_info?.engine || "CyberShield Heuristics"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cyber-border/60">
                <span>SSRF Protection:</span>
                <span className="text-emerald-400 font-semibold">Active & Enforced</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cyber-border/60">
                <span>Analysis Status:</span>
                <span className="capitalize font-semibold text-cyber-text">{report.status}</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-3">
            <h4 className="text-xs font-bold text-cyber-text uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-cyber-cyan" />
              <span>Model Limitations & Boundaries</span>
            </h4>
            <ul className="text-xs text-cyber-muted space-y-1 list-disc list-inside">
              {report.limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Consult AI Assistant CTA */}
        <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-cyan/30 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <div>
            <h4 className="text-sm font-bold text-cyber-text">Need Guidance on This Threat?</h4>
            <p className="text-xs text-cyber-muted mt-0.5">
              Our AI Security Assistant can break down the exact implications of this report.
            </p>
          </div>
          <Link
            href={`/assistant?reportId=${report.id}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-cyber-cyan hover:bg-cyan-400 text-cyber-dark transition-all shadow-[0_0_15px_rgba(34,211,238,0.25)] flex-shrink-0"
          >
            <span>Ask Security Assistant</span>
            <Share2 className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </Sidebar>
  );
}
