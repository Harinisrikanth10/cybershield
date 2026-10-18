"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Menu, X, ArrowRight, User as UserIcon } from "lucide-react";
import { Logo } from "@/components/logo";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password");

  if (isAuthPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyber-border/80 bg-cyber-dark/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo variant="horizontal" href="/" />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-cyber-muted">
          <Link
            href="/#features"
            className="hover:text-cyber-cyan transition-colors"
          >
            Capabilities
          </Link>
          <Link
            href="/#how-it-works"
            className="hover:text-cyber-cyan transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/#security"
            className="hover:text-cyber-cyan transition-colors"
          >
            Responsible AI
          </Link>
          <Link
            href="/learn"
            className="hover:text-cyber-cyan transition-colors"
          >
            Learning Center
          </Link>
          <Link
            href="/assistant"
            className="hover:text-cyber-cyan transition-colors"
          >
            AI Assistant
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-cyber-card border border-cyber-border hover:border-cyber-cyan/50 text-cyber-text transition-all"
              >
                Security Console
              </Link>
              <Link
                href="/analyze"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-cyber-cyan hover:bg-cyan-400 text-cyber-dark transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              >
                <span>Analyze Threat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-semibold text-cyber-muted hover:text-cyber-text transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/analyze"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-cyber-cyan hover:bg-cyan-400 text-cyber-dark transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              >
                <span>Analyze Threat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-cyber-muted hover:text-cyber-text focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 border-b border-cyber-border bg-cyber-dark space-y-3">
          <Link
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-cyber-muted hover:text-cyber-cyan"
          >
            Capabilities
          </Link>
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-cyber-muted hover:text-cyber-cyan"
          >
            How It Works
          </Link>
          <Link
            href="/learn"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-cyber-muted hover:text-cyber-cyan"
          >
            Learning Center
          </Link>
          <Link
            href="/assistant"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-cyber-muted hover:text-cyber-cyan"
          >
            AI Assistant
          </Link>
          <div className="pt-3 border-t border-cyber-border flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm rounded-lg bg-cyber-card border border-cyber-border text-cyber-text font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/analyze"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm rounded-lg bg-cyber-cyan text-cyber-dark font-semibold"
                >
                  Analyze Threat
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm text-cyber-muted font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm rounded-lg bg-cyber-cyan text-cyber-dark font-semibold"
                >
                  Create Free Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
