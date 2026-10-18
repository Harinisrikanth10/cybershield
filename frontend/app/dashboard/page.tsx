"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Globe,
  MessageSquare,
  Eye,
  Mic,
  Video,
  Bot,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Info,
  ExternalLink,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { DashboardSummaryResponse } from "@/types";
import { formatDateTime, getRiskBadgeClasses } from "@/lib/utils";

export default function DashboardPage() {
  const { user, loginAsDemo } = useAuth();
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardSummary();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  // Charts data preparation
  const riskChartData = data
    ? [
        { name: "Low", value: data.risk_distribution.low, color: "#10B981" },
        { name: "Moderate", value: data.risk_distribution.medium, color: "#F59E0B" },
        { name: "High", value: data.risk_distribution.high, color: "#F97316" },
        { name: "Critical", value: data.risk_distribution.critical, color: "#EF4444" },
      ].filter((item) => item.value > 0)
    : [];

  const categoryChartData = data
    ? [
        { name: "URL", count: data.category_distribution.url },
        { name: "Text", count: data.category_distribution.text },
        { name: "Image", count: data.category_distribution.image },
        { name: "Audio", count: data.category_distribution.audio },
        { name: "Video", count: data.category_distribution.video },
      ]
    : [];

  return (
    <Sidebar>
      <div className="space-y-8">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-cyber-border/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-cyber-text tracking-tight flex items-center gap-2">
              <span>Security Operations Overview</span>
            </h1>
            <p className="text-xs text-cyber-muted mt-1">
              Active account: <span className="text-cyber-cyan font-mono">{user?.email || "Analyst"}</span> &bull; Telemetry & Incident Registry
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/analyze"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-cyber-dark bg-cyber-cyan hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Launch Threat Scan</span>
            </Link>
          </div>
        </div>

        {/* Notice banner clarifying data source */}
        <div className="p-3.5 rounded-xl bg-cyber-sidebar border border-cyber-border/80 flex items-center justify-between text-xs text-cyber-muted">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-cyber-cyan flex-shrink-0" />
            <span>
              All metrics reflect user-submitted forensic records and configured heuristic rules. No simulated global threat feed is displayed.
            </span>
          </div>
          {data?.total_analyses === 0 && (
            <button
              onClick={async () => {
                await loginAsDemo();
                await fetchSummary();
              }}
              className="text-xs text-cyber-cyan hover:underline font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Demo Seed Data</span>
            </button>
          )}
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-cyber-card border border-cyber-border flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-cyber-muted uppercase">
              <span>Total Scans</span>
              <Clock className="w-4 h-4 text-cyber-cyan" />
            </div>
            <div className="mt-4">
              <span className="text-3xl sm:text-4xl font-extrabold text-cyber-text font-mono">
                {data?.total_analyses ?? 0}
              </span>
              <p className="text-[11px] text-cyber-muted mt-1">Inspected across 5 vectors</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-cyber-card border border-red-500/30 bg-red-500/[0.03] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-red-400 uppercase">
              <span>Critical Threats</span>
              <AlertOctagon className="w-4 h-4 text-red-400" />
            </div>
            <div className="mt-4">
              <span className="text-3xl sm:text-4xl font-extrabold text-red-400 font-mono">
                {data?.critical_risk_items ?? 0}
              </span>
              <p className="text-[11px] text-cyber-muted mt-1">Score &ge; 75 / 100</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-cyber-card border border-orange-500/30 bg-orange-500/[0.03] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-orange-400 uppercase">
              <span>High Risk</span>
              <ShieldAlert className="w-4 h-4 text-orange-400" />
            </div>
            <div className="mt-4">
              <span className="text-3xl sm:text-4xl font-extrabold text-orange-400 font-mono">
                {data?.high_risk_items ?? 0}
              </span>
              <p className="text-[11px] text-cyber-muted mt-1">Score 50–74 / 100</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-cyber-card border border-emerald-500/30 bg-emerald-500/[0.03] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 uppercase">
              <span>Low Risk (Safe)</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-4">
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">
                {data?.low_risk_items ?? 0}
              </span>
              <p className="text-[11px] text-cyber-muted mt-1">Score &le; 24 / 100</p>
            </div>
          </div>
        </div>

        {/* Quick-Action Trigger Cards */}
        <div>
          <h2 className="text-sm font-bold text-cyber-text uppercase tracking-wider mb-3">
            Quick Actions &mdash; Launch Analysis
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link
              href="/analyze?tab=url"
              className="p-4 rounded-xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/50 hover:bg-cyber-elevated transition-all flex flex-col items-center text-center group"
            >
              <div className="w-10 h-10 rounded-lg bg-cyber-dark flex items-center justify-center text-cyber-cyan group-hover:scale-110 transition-transform mb-2">
                <Globe className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-cyber-text">Analyze URL</span>
              <span className="text-[10px] text-cyber-muted mt-0.5">Phishing & TLDs</span>
            </Link>

            <Link
              href="/analyze?tab=text"
              className="p-4 rounded-xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/50 hover:bg-cyber-elevated transition-all flex flex-col items-center text-center group"
            >
              <div className="w-10 h-10 rounded-lg bg-cyber-dark flex items-center justify-center text-cyber-cyan group-hover:scale-110 transition-transform mb-2">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-cyber-text">Inspect Text</span>
              <span className="text-[10px] text-cyber-muted mt-0.5">SMS & Emails</span>
            </Link>

            <Link
              href="/analyze?tab=image"
              className="p-4 rounded-xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/50 hover:bg-cyber-elevated transition-all flex flex-col items-center text-center group"
            >
              <div className="w-10 h-10 rounded-lg bg-cyber-dark flex items-center justify-center text-cyber-cyan group-hover:scale-110 transition-transform mb-2">
                <Eye className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-cyber-text">Analyze Image</span>
              <span className="text-[10px] text-cyber-muted mt-0.5">EXIF & ELA</span>
            </Link>

            <Link
              href="/analyze?tab=audio"
              className="p-4 rounded-xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/50 hover:bg-cyber-elevated transition-all flex flex-col items-center text-center group"
            >
              <div className="w-10 h-10 rounded-lg bg-cyber-dark flex items-center justify-center text-cyber-cyan group-hover:scale-110 transition-transform mb-2">
                <Mic className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-cyber-text">Inspect Audio</span>
              <span className="text-[10px] text-cyber-muted mt-0.5">Voice Clones</span>
            </Link>

            <Link
              href="/analyze?tab=video"
              className="p-4 rounded-xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/50 hover:bg-cyber-elevated transition-all flex flex-col items-center text-center group"
            >
              <div className="w-10 h-10 rounded-lg bg-cyber-dark flex items-center justify-center text-cyber-cyan group-hover:scale-110 transition-transform mb-2">
                <Video className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-cyber-text">Analyze Video</span>
              <span className="text-[10px] text-cyber-muted mt-0.5">Sampled Frames</span>
            </Link>

            <Link
              href="/assistant"
              className="p-4 rounded-xl bg-cyber-card border border-cyber-cyan/40 bg-cyber-cyan/[0.04] hover:bg-cyber-cyan/[0.08] transition-all flex flex-col items-center text-center group"
            >
              <div className="w-10 h-10 rounded-lg bg-cyber-dark flex items-center justify-center text-cyber-cyan group-hover:scale-110 transition-transform mb-2">
                <Bot className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-cyber-cyan">Ask Assistant</span>
              <span className="text-[10px] text-cyber-muted mt-0.5">AI Security Chat</span>
            </Link>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Distribution Chart */}
          <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border">
            <h3 className="text-sm font-bold text-cyber-text mb-1">Risk Severity Distribution</h3>
            <p className="text-xs text-cyber-muted mb-4">Proportion of scanned items by severity band.</p>

            {riskChartData.length > 0 ? (
              <div className="h-60 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0B1628",
                        borderColor: "#23364F",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-60 flex flex-col items-center justify-center text-cyber-muted text-xs">
                <span>No scan data recorded yet.</span>
                <Link href="/analyze" className="text-cyber-cyan hover:underline mt-2">
                  Submit your first analysis &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Submission Category Bar Chart */}
          <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border">
            <h3 className="text-sm font-bold text-cyber-text mb-1">Threat Vectors Analyzed</h3>
            <p className="text-xs text-cyber-muted mb-4">Volume breakdown across inspected artifact types.</p>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0B1628",
                      borderColor: "#23364F",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#22D3EE" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Analyses Table */}
        <div className="rounded-2xl bg-cyber-card border border-cyber-border overflow-hidden">
          <div className="p-5 border-b border-cyber-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-cyber-text">Recent Threat Investigations</h3>
              <p className="text-xs text-cyber-muted mt-0.5">Latest submitted URLs, messages, and forensic files.</p>
            </div>
            <Link
              href="/history"
              className="text-xs text-cyber-cyan hover:underline font-semibold flex items-center gap-1"
            >
              <span>View Full History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data && data.recent_activity.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cyber-sidebar text-cyber-muted uppercase tracking-wider font-semibold border-b border-cyber-border">
                  <tr>
                    <th className="py-3 px-4">Artifact / Target</th>
                    <th className="py-3 px-4">Vector</th>
                    <th className="py-3 px-4">Risk Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-border">
                  {data.recent_activity.map((item) => {
                    const badgeClasses = getRiskBadgeClasses(item.risk_category);
                    return (
                      <tr key={item.id} className="hover:bg-cyber-elevated/50 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-cyber-text max-w-xs truncate">
                          {item.target_summary}
                        </td>
                        <td className="py-3.5 px-4 uppercase text-cyber-muted font-mono text-[10px]">
                          {item.submission_type}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold border text-[11px] ${badgeClasses.bg} ${badgeClasses.text} ${badgeClasses.border}`}
                          >
                            {item.risk_score} / 100 ({item.risk_category})
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="capitalize text-cyber-muted text-[11px]">{item.status}</span>
                        </td>
                        <td className="py-3.5 px-4 text-cyber-muted text-[11px]">
                          {formatDateTime(item.created_at)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/reports/${item.id}`}
                            className="text-cyber-cyan hover:underline font-semibold inline-flex items-center gap-1"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-cyber-muted text-xs">
              <ShieldAlert className="w-8 h-8 text-cyber-muted/50 mx-auto mb-2" />
              <p>No recent activity. Submit a URL or message to populate your security registry.</p>
              <Link
                href="/analyze"
                className="inline-block mt-3 px-4 py-2 rounded-lg bg-cyber-cyan text-cyber-dark font-semibold text-xs"
              >
                Start First Scan
              </Link>
            </div>
          )}
        </div>

        {/* Security Tips Row */}
        {data && data.security_tips.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-cyber-text uppercase tracking-wider mb-3">
              Actionable Security Intelligence
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.security_tips.map((tip) => (
                <div key={tip.id} className="p-4 rounded-xl bg-cyber-card border border-cyber-border">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-cyber-cyan">
                      {tip.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-cyber-text">{tip.title}</h4>
                  <p className="mt-1 text-xs text-cyber-muted leading-relaxed">{tip.tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
