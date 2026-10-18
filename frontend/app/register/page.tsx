"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  // Password strength calculation
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hasMinLength) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register(email, password, fullName);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please choose another email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark cyber-grid-pattern flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo variant="full" href="/" />
        </div>

        <div className="rounded-2xl bg-cyber-card border border-cyber-border p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-cyber-text">Create Account</h2>
            <p className="text-xs text-cyber-muted mt-1">Join the CyberShield AI defense network.</p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-cyber-muted mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-cyber-muted absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Security Analyst"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cyber-sidebar border border-cyber-border text-sm text-cyber-text placeholder:text-cyber-muted/50 focus:outline-none focus:border-cyber-cyan transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-cyber-muted mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-cyber-muted absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cyber-sidebar border border-cyber-border text-sm text-cyber-text placeholder:text-cyber-muted/50 focus:outline-none focus:border-cyber-cyan transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-cyber-muted mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-cyber-muted absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cyber-sidebar border border-cyber-border text-sm text-cyber-text placeholder:text-cyber-muted/50 focus:outline-none focus:border-cyber-cyan transition-colors"
                />
              </div>

              {/* Password strength checklist */}
              <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-[10px]">
                <div className={`flex items-center gap-1 ${hasMinLength ? "text-emerald-400" : "text-cyber-muted"}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>8+ chars</span>
                </div>
                <div className={`flex items-center gap-1 ${hasNumber ? "text-emerald-400" : "text-cyber-muted"}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Number</span>
                </div>
                <div className={`flex items-center gap-1 ${hasSymbol ? "text-emerald-400" : "text-cyber-muted"}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Symbol</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-cyber-muted mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-cyber-muted absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cyber-sidebar border border-cyber-border text-sm text-cyber-text placeholder:text-cyber-muted/50 focus:outline-none focus:border-cyber-cyan transition-colors"
                />
              </div>
              {confirmPassword && (
                <p className={`text-[11px] mt-1 ${passwordsMatch ? "text-emerald-400" : "text-red-400"}`}>
                  {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-cyber-dark bg-cyber-cyan hover:bg-cyan-400 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] mt-4"
            >
              {loading ? (
                <span>Registering account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-cyber-muted">
            Already registered?{" "}
            <Link href="/login" className="text-cyber-cyan font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-cyber-muted">
          <Link href="/" className="hover:text-cyber-text transition-colors">
            &larr; Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
