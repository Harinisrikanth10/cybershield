"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  History,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  ShieldAlert,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { api } from "@/lib/api";
import { AnalysisResponse } from "@/types";
import { formatDateTime, getRiskBadgeClasses } from "@/lib/utils";

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "score">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Delete modal state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getAnalyses({
        search: search.trim() || undefined,
        type: typeFilter === "all" ? undefined : typeFilter,
        risk: riskFilter === "all" ? undefined : riskFilter,
      });
      setAnalyses(data);
    } catch (err: any) {
      setError(err.message || "Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [typeFilter, riskFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await api.deleteAnalysis(deleteTargetId);
      setAnalyses((prev) => prev.filter((a) => a.id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete record.");
    } finally {
      setDeleting(false);
    }
  };

  // Sorting
  const sortedAnalyses = [...analyses].sort((a, b) => {
    if (sortBy === "date") {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    } else {
      return sortOrder === "desc" ? b.risk_score - a.risk_score : a.risk_score - b.risk_score;
    }
  });

  return (
    <Sidebar>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-cyber-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-cyber-text tracking-tight flex items-center gap-2">
              <History className="w-6 h-6 text-cyber-cyan" />
              <span>Threat Analysis History</span>
            </h1>
            <p className="text-xs text-cyber-muted mt-1">
              Searchable, persistent ledger of past investigations, scores, and evidence logs.
            </p>
          </div>

          <Link
            href="/analyze"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-cyber-cyan text-cyber-dark hover:bg-cyan-400 transition-colors shadow-[0_0_12px_rgba(34,211,238,0.25)]"
          >
            <span>New Threat Scan</span>
          </Link>
        </div>

        {/* Search and Filters Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="p-4 rounded-xl bg-cyber-card border border-cyber-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-cyber-muted absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search target URLs, domains, or message summaries..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-cyber-sidebar border border-cyber-border text-xs text-cyber-text placeholder:text-cyber-muted/50 focus:outline-none focus:border-cyber-cyan"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-2 rounded-lg bg-cyber-sidebar border border-cyber-border text-xs text-cyber-text focus:outline-none focus:border-cyber-cyan"
            >
              <option value="all">All Vectors</option>
              <option value="url">URL</option>
              <option value="text">Text / Email</option>
              <option value="image">Image</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
            </select>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-2.5 py-2 rounded-lg bg-cyber-sidebar border border-cyber-border text-xs text-cyber-text focus:outline-none focus:border-cyber-cyan"
            >
              <option value="all">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
            </select>

            <button
              type="button"
              onClick={() => {
                if (sortBy === "date") {
                  setSortBy("score");
                } else {
                  setSortBy("date");
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyber-sidebar border border-cyber-border text-xs text-cyber-text hover:border-cyber-cyan transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-cyber-cyan" />
              <span>Sort: {sortBy === "date" ? "Date" : "Risk Score"}</span>
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyber-elevated border border-cyber-cyan/50 text-cyber-cyan hover:bg-cyber-card text-xs font-semibold"
            >
              Search
            </button>
          </div>
        </form>

        {/* Deletion confirmation dialog */}
        {deleteTargetId && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-cyber-card border border-cyber-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-cyber-text">Delete Investigation Record?</h3>
              <p className="text-xs text-cyber-muted">
                Are you sure you want to remove this record? This action will permanently remove the analysis and cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteTargetId(null)}
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
                  {deleting ? "Deleting..." : "Delete Permanently"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table View */}
        <div className="rounded-2xl bg-cyber-card border border-cyber-border overflow-hidden shadow-xl">
          {loading ? (
            <div className="py-20 text-center text-cyber-muted text-xs">
              <RefreshCw className="w-8 h-8 text-cyber-cyan animate-spin mx-auto mb-3" />
              <span>Querying database index...</span>
            </div>
          ) : sortedAnalyses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cyber-sidebar text-cyber-muted uppercase tracking-wider font-semibold border-b border-cyber-border">
                  <tr>
                    <th className="py-3 px-4">Artifact / Target</th>
                    <th className="py-3 px-4">Vector</th>
                    <th className="py-3 px-4">Risk Evaluation</th>
                    <th className="py-3 px-4">Indicators</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-border">
                  {sortedAnalyses.map((item) => {
                    const badge = getRiskBadgeClasses(item.risk_category);
                    return (
                      <tr key={item.id} className="hover:bg-cyber-elevated/40 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-cyber-text max-w-sm truncate">
                          {item.target_summary}
                        </td>
                        <td className="py-3.5 px-4 uppercase text-cyber-muted font-mono text-[10px]">
                          {item.submission_type}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold border text-[11px] ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            {item.risk_score} / 100 ({item.risk_category})
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-cyber-muted">
                          {item.findings.length} signal{item.findings.length === 1 ? "" : "s"}
                        </td>
                        <td className="py-3.5 px-4 text-cyber-muted font-mono text-[11px]">
                          {formatDateTime(item.created_at)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/reports/${item.id}`}
                              className="text-cyber-cyan hover:underline font-semibold inline-flex items-center gap-1"
                            >
                              <span>Report</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                            <button
                              onClick={() => setDeleteTargetId(item.id)}
                              className="p-1 rounded text-cyber-muted hover:text-red-400 transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-cyber-muted text-xs">
              <ShieldAlert className="w-8 h-8 text-cyber-muted/40 mx-auto mb-2" />
              <p>No analysis records matched your filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
