"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  History,
  Bell,
  Bot,
  GraduationCap,
  Settings,
  LogOut,
  PlusCircle,
  Menu,
  X,
  User as UserIcon,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/analyze", label: "Threat Center", icon: ShieldAlert, highlight: true },
  { href: "/alerts", label: "Security Alerts", icon: Bell, badge: true },
  { href: "/history", label: "Analysis History", icon: History },
  { href: "/assistant", label: "AI Assistant", icon: Bot },
  { href: "/learn", label: "Security Academy", icon: GraduationCap },
  { href: "/settings", label: "Settings & Profile", icon: Settings },
];

export function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [unreadAlerts, setUnreadAlerts] = useState<number>(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (user) {
      api.getAlerts(true).then((alerts) => {
        setUnreadAlerts(alerts.length);
      }).catch(() => {});
    }
  }, [user, pathname]);

  return (
    <div className="min-h-screen bg-cyber-dark text-cyber-text flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-cyber-border bg-cyber-sidebar z-40 sticky top-0">
        <Logo variant="horizontal" href="/dashboard" />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-cyber-muted hover:text-cyber-text focus:outline-none"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-cyber-sidebar border-r border-cyber-border flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="p-5 border-b border-cyber-border/70 flex items-center justify-between">
            <Logo variant="horizontal" href="/dashboard" showTagline />
          </div>

          {/* Quick Action Button */}
          <div className="px-4 py-4">
            <Link
              href="/analyze"
              onClick={() => setMobileOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold text-cyber-dark bg-cyber-cyan hover:bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.25)] transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Threat Scan</span>
            </Link>
          </div>

          {/* Nav List */}
          <nav className="px-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-cyber-card border border-cyber-cyan/40 text-cyber-cyan shadow-[inset_0_0_10px_rgba(34,211,238,0.08)]"
                      : "text-cyber-muted hover:text-cyber-text hover:bg-cyber-card/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-cyber-cyan" : "text-cyber-muted"}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && unreadAlerts > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                      {unreadAlerts}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-cyber-border/70 bg-cyber-dark/40">
          <div className="flex items-center justify-between">
            <Link
              href="/settings"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 min-w-0 hover:opacity-85 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-cyber-card border border-cyber-border flex items-center justify-center text-cyber-cyan flex-shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="truncate text-left">
                <p className="text-xs font-medium text-cyber-text truncate">
                  {user?.full_name || "Analyst"}
                </p>
                <p className="text-[10px] text-cyber-muted truncate">{user?.email || "demo@cybershield.ai"}</p>
              </div>
            </Link>

            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 rounded-md text-cyber-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Page Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Backdrop for mobile drawer */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          />
        )}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
