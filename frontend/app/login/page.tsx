"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Sparkles, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/logo";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, loginAsDemo } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("demo@cybershield.ai");
    setPassword("CyberShield2026!");
    setError(null);
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginAsDemo();
    } catch (err: any) {
      setError(err.message || "Demo login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark cyber-grid-pattern flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Logo variant="full" href="/" />
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl bg-cyber-card border border-cyber-border p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-cyber-text">Welcome Back</h2>
            <p className="text-xs text-cyber-muted mt-1">Sign in to your security investigation console.</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span>{error}</span>
                <p className="mt-1 text-[11px] text-cyber-muted">
                  First time here? Click &ldquo;One-Click Demo Sign In&rdquo; below or{" "}
                  <Link href="/register" className="text-cyber-cyan underline">
                    create a free account
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="analyst@organization.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cyber-sidebar border border-cyber-border text-sm text-cyber-text placeholder:text-cyber-muted/50 focus:outline-none focus:border-cyber-cyan transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-cyber-muted">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-cyber-cyan hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-cyber-dark bg-cyber-cyan hover:bg-cyan-400 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] mt-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Info & Actions */}
          <div className="mt-6 pt-5 border-t border-cyber-border/80 space-y-3">
            <div className="p-3 rounded-xl bg-cyber-sidebar/80 border border-cyber-border flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <p className="text-[11px] font-semibold text-cyber-cyan flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pre-Configured Demo Account</span>
                </p>
                <p className="text-[10px] text-cyber-muted font-mono">
                  demo@cybershield.ai &bull; CyberShield2026!
                </p>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="px-2.5 py-1 text-[11px] font-semibold text-cyber-cyan hover:text-cyan-300 bg-cyber-card border border-cyber-cyan/30 rounded-lg hover:border-cyber-cyan transition-colors"
              >
                Auto-Fill
              </button>
            </div>

            <button
              onClick={handleDemoLogin}
              type="button"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-cyber-text bg-cyber-elevated hover:bg-cyber-card border border-cyber-cyan/40 hover:border-cyber-cyan transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyber-cyan" />
              <span>One-Click Demo Sign In</span>
            </button>
            <p className="text-[10px] text-center text-cyber-muted">
              Instantly explores pre-seeded threat scans, alerts, and learning courses.
            </p>
          </div>

          <div className="mt-6 text-center text-xs text-cyber-muted">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-cyber-cyan font-semibold hover:underline">
              Create an account
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
