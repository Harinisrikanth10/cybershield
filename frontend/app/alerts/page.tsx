"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  Search,
  Filter,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { api } from "@/lib/api";
import { Alert } from "@/types";
import { formatDateTime, getRiskBadgeClasses } from "@/lib/utils";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getAlerts(unreadOnly, severityFilter === "all" ? undefined : severityFilter);
      setAlerts(data);
    } catch (err: any) {
      setError(err.message || "Failed to load alerts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [unreadOnly, severityFilter]);

  const handleToggleRead = async (id: string, currentStatus: boolean) => {
    try {
      await api.markAlertRead(id, !currentStatus);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_read: !currentStatus } : a))
      );
    } catch (e) {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllAlertsRead();
      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
    } catch (e) {
      // Ignore
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      await api.deleteAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      // Ignore
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (!searchQuery.trim()) return true;
    return (
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.message.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <Sidebar>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-cyber-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-cyber-text tracking-tight flex items-center gap-2">
              <Bell className="w-6 h-6 text-cyber-cyan" />
              <span>Security Alerts Center</span>
            </h1>
            <p className="text-xs text-cyber-muted mt-1">
              Automated notifications generated when submitted items exceed high-risk thresholds.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyber-card border border-cyber-border hover:border-cyber-cyan text-cyber-text transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-cyber-cyan" />
              <span>Mark All as Read</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-xl bg-cyber-card border border-cyber-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-cyber-muted absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search alerts by title or description..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-cyber-sidebar border border-cyber-border text-xs text-cyber-text placeholder:text-cyber-muted/50 focus:outline-none focus:border-cyber-cyan"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-cyber-muted cursor-pointer select-none">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
                className="rounded border-cyber-border bg-cyber-sidebar text-cyber-cyan focus:ring-0"
              />
              <span>Unread Only</span>
            </label>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-cyber-sidebar border border-cyber-border text-xs text-cyber-text focus:outline-none focus:border-cyber-cyan"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Moderate</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Alerts List */}
        {loading ? (
          <div className="py-20 text-center text-cyber-muted text-xs">
            <div className="w-8 h-8 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Checking security alert queues...</span>
          </div>
        ) : filteredAlerts.length > 0 ? (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const badge = getRiskBadgeClasses(alert.severity);
              return (
                <div
                  key={alert.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    alert.is_read
                      ? "bg-cyber-card/60 border-cyber-border opacity-75"
                      : "bg-cyber-card border-cyber-border hover:border-cyber-cyan/50 shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {alert.severity === "critical" ? (
                          <AlertOctagon className="w-5 h-5 text-red-400" />
                        ) : alert.severity === "high" ? (
                          <ShieldAlert className="w-5 h-5 text-orange-400" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-400" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-cyber-text">{alert.title}</h3>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            {alert.severity}
                          </span>
                          {!alert.is_read && (
                            <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
                          )}
                        </div>

                        <p className="text-xs text-cyber-muted leading-relaxed">{alert.message}</p>

                        <div className="pt-2 flex items-center gap-4 text-[11px] text-cyber-muted">
                          <span>{formatDateTime(alert.created_at)}</span>

                          {alert.analysis_id && (
                            <Link
                              href={`/reports/${alert.analysis_id}`}
                              className="text-cyber-cyan hover:underline font-semibold flex items-center gap-1"
                            >
                              <span>View Threat Report</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleToggleRead(alert.id, alert.is_read)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-cyber-sidebar border border-cyber-border hover:border-cyber-cyan text-cyber-muted hover:text-cyber-text transition-colors"
                      >
                        {alert.is_read ? "Mark Unread" : "Mark Read"}
                      </button>

                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="p-1.5 rounded-lg text-cyber-muted hover:text-red-400 hover:bg-red-500/10 border border-cyber-border transition-colors"
                        title="Dismiss Alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center rounded-2xl bg-cyber-card border border-cyber-border p-8">
            <Bell className="w-10 h-10 text-cyber-muted/40 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-cyber-text">No Security Alerts</h3>
            <p className="text-xs text-cyber-muted mt-1 max-w-sm mx-auto">
              You have no active threat alerts matching your filter criteria. New alerts are automatically triggered when scans exceed risk score 50.
            </p>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
