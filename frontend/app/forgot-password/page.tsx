"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.forgotPassword(email);
    } catch (e) {
      // Ignore errors to prevent account enumeration
    } finally {
      setLoading(false);
      setSubmitted(true);
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
            <h2 className="text-xl font-bold text-cyber-text">Reset Password</h2>
            <p className="text-xs text-cyber-muted mt-1">
              Enter your email to receive recovery instructions.
            </p>
          </div>

          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-cyber-text">Dispatch Request Received</h3>
              <p className="text-xs text-cyber-muted">
                If an account matches <span className="text-cyber-cyan font-mono">{email}</span>, a secure password reset link has been dispatched.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-cyber-elevated border border-cyber-border text-cyber-cyan hover:bg-cyber-card transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          ) : (
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
                    placeholder="analyst@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cyber-sidebar border border-cyber-border text-sm text-cyber-text placeholder:text-cyber-muted/50 focus:outline-none focus:border-cyber-cyan transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-cyber-dark bg-cyber-cyan hover:bg-cyan-400 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] mt-4"
              >
                {loading ? <span>Dispatching...</span> : <span>Send Recovery Instructions</span>}
              </button>

              <div className="pt-4 text-center">
                <Link
                  href="/login"
                  className="text-xs text-cyber-muted hover:text-cyber-cyan transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
