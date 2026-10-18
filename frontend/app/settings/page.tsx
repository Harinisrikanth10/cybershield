"use client";

import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  User as UserIcon,
  Bell,
  Download,
  Trash2,
  CheckCircle2,
  AlertOctagon,
  Moon,
  Sun,
  Shield,
  Save,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();

  const [fullName, setFullName] = useState("");
  const [theme, setTheme] = useState("dark");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyHighRisk, setNotifyHighRisk] = useState(true);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Deletion modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setTheme(user.theme || "dark");
      setNotifyEmail(user.notify_email);
      setNotifyHighRisk(user.notify_high_risk);
    }
  }, [user]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await api.updateProfile({
        full_name: fullName,
        theme,
        notify_email: notifyEmail,
        notify_high_risk: notifyHighRisk,
      });
      await refreshUser();
      setSuccessMsg("Profile and preferences saved successfully.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await api.exportProfileData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cybershield-account-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setErrorMsg(e.message || "Export failed.");
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.deleteAccount();
      await logout();
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to delete account.");
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <Sidebar>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="pb-2 border-b border-cyber-border">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-cyber-text tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-cyber-cyan" />
            <span>Account & System Settings</span>
          </h1>
          <p className="text-xs text-cyber-muted mt-1">
            Manage your personal profile, threat notification triggers, and data privacy rights.
          </p>
        </div>

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400">
            <AlertOctagon className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Profile Card */}
        <form onSubmit={handleSavePreferences} className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-6 shadow-xl">
          <h3 className="text-sm font-bold text-cyber-text uppercase tracking-wider flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-cyber-cyan" />
            <span>Profile Identity</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-cyber-muted font-semibold mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-cyber-sidebar border border-cyber-border text-cyber-text focus:outline-none focus:border-cyber-cyan"
              />
            </div>

            <div>
              <label className="block text-cyber-muted font-semibold mb-1.5">
                Email Address (Primary Identity)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full px-3.5 py-2.5 rounded-xl bg-cyber-sidebar/50 border border-cyber-border text-cyber-muted cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-cyber-border space-y-4">
            <h4 className="text-xs font-bold text-cyber-text uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyber-cyan" />
              <span>Notification Preferences</span>
            </h4>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyHighRisk}
                  onChange={(e) => setNotifyHighRisk(e.target.checked)}
                  className="rounded border-cyber-border bg-cyber-sidebar text-cyber-cyan focus:ring-0"
                />
                <div className="text-xs">
                  <p className="font-semibold text-cyber-text">High-Risk Incident Alerts</p>
                  <p className="text-cyber-muted">Generate immediate alert badges when scans exceed risk score 50.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="rounded border-cyber-border bg-cyber-sidebar text-cyber-cyan focus:ring-0"
                />
                <div className="text-xs">
                  <p className="font-semibold text-cyber-text">Weekly Security Digest</p>
                  <p className="text-cyber-muted">Receive educational security lessons and scam advisory updates.</p>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-cyber-border flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-cyber-cyan hover:bg-cyan-400 text-cyber-dark transition-all shadow-[0_0_15px_rgba(34,211,238,0.25)]"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Changes..." : "Save Preferences"}</span>
            </button>
          </div>
        </form>

        {/* Privacy & Right to Erasure */}
        <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-5 shadow-xl">
          <h3 className="text-sm font-bold text-cyber-text uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyber-cyan" />
            <span>Data Privacy & Rights</span>
          </h3>
          <p className="text-xs text-cyber-muted leading-relaxed">
            In compliance with responsible AI and digital privacy principles, you have full ownership of your security logs.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-cyber-sidebar border border-cyber-border">
            <div>
              <h4 className="text-xs font-bold text-cyber-text">Export Personal Security Data</h4>
              <p className="text-[11px] text-cyber-muted">Download all forensic logs, alerts, and learning achievements in JSON format.</p>
            </div>
            <button
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-cyber-card border border-cyber-border hover:border-cyber-cyan text-cyber-text transition-colors flex-shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-cyber-cyan" />
              <span>Download JSON Archive</span>
            </button>
          </div>

          {/* Danger Zone */}
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/[0.04] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-red-400">Permanently Delete Account</h4>
              <p className="text-[11px] text-cyber-muted">
                Irreversibly erase all threat analyses, chat transcripts, and enrolled credentials from our database.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white transition-all flex-shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>

        {/* Deletion Dialog */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-cyber-card border border-red-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-red-400" />
                <span>Confirm Account Erasure</span>
              </h3>
              <p className="text-xs text-cyber-muted leading-relaxed">
                Are you absolutely sure you want to permanently erase your account and all associated threat records? This action is immediate and non-reversible.
              </p>
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyber-sidebar border border-cyber-border text-cyber-text"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-500 hover:bg-red-600 text-white"
                >
                  {deleting ? "Erasing..." : "Yes, Erase Everything"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
