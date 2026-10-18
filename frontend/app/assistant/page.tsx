"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bot,
  Send,
  Trash2,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Info,
  RefreshCw,
  FileText,
  User as UserIcon,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { api } from "@/lib/api";
import { ChatMessage, ReportDetailResponse } from "@/types";

const SUGGESTED_PROMPTS = [
  "What should I do if I clicked a suspicious link?",
  "How can I tell if an audio message is an AI voice clone?",
  "What does my CyberShield risk score mean?",
  "How do phishers trick users with subdomains?",
  "What are best practices for phishing-resistant MFA?",
];

function AssistantContent() {
  const searchParams = useSearchParams();
  const initialReportId = searchParams.get("reportId");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachedReport, setAttachedReport] = useState<ReportDetailResponse | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadHistory = async () => {
    try {
      const history = await api.getAssistantHistory();
      if (history.length > 0) {
        setMessages(history);
      } else {
        // Welcome message
        setMessages([
          {
            id: "welcome-1",
            role: "assistant",
            content:
              "Hello! I am your **CyberShield AI Security Specialist**. I can help you investigate suspicious messages, interpret threat analysis reports, understand deepfake indicators, and adopt safer digital habits.\n\nHow can I assist your defense today?",
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (e) {
      // Fallback
    }
  };

  useEffect(() => {
    loadHistory();
    if (initialReportId) {
      api.getReport(initialReportId).then((r) => setAttachedReport(r)).catch(() => {});
    }
  }, [initialReportId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: "temp-" + Date.now(),
      role: "user",
      content: text,
      attached_report_id: attachedReport?.id,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const assistantMsg = await api.sendAssistantMessage(text, attachedReport?.id);
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: "err-" + Date.now(),
        role: "assistant",
        content: `*Error generating response: ${err.message || "Please check backend connectivity."}*`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.clearAssistantHistory();
      setMessages([
        {
          id: "welcome-2",
          role: "assistant",
          content: "Conversation history cleared. How can I help you today?",
          created_at: new Date().toISOString(),
        },
      ]);
      setAttachedReport(null);
    } catch (e) {
      // Ignore
    }
  };

  return (
    <Sidebar>
      <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyber-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyber-card border border-cyber-cyan/50 flex items-center justify-center text-cyber-cyan shadow-[0_0_12px_rgba(34,211,238,0.25)]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-cyber-text flex items-center gap-2">
                <span>AI Cybersecurity Assistant</span>
                <span className="text-[10px] uppercase font-semibold text-cyber-cyan bg-cyber-card px-2 py-0.5 rounded border border-cyber-cyan/30">
                  Defensive AI
                </span>
              </h1>
              <p className="text-[11px] text-cyber-muted">
                Trained on threat mitigation, phishing patterns, and incident recovery.
              </p>
            </div>
          </div>

          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-cyber-muted hover:text-red-400 bg-cyber-card border border-cyber-border hover:border-red-500/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>

        {/* Attached Report Context Badge (if active) */}
        {attachedReport && (
          <div className="p-3 rounded-xl bg-cyber-sidebar border border-cyber-cyan/40 flex items-center justify-between text-xs text-cyber-text flex-shrink-0">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-cyber-cyan flex-shrink-0" />
              <span className="truncate">
                Attached Context: <strong className="text-cyber-cyan">{attachedReport.target_summary}</strong> ({attachedReport.risk_category} Risk &bull; {attachedReport.risk_score}/100)
              </span>
            </div>
            <button
              onClick={() => setAttachedReport(null)}
              className="text-[11px] text-cyber-muted hover:text-red-400 font-semibold ml-2"
            >
              Detach
            </button>
          </div>
        )}

        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-cyber-card border border-cyber-cyan/50 text-cyber-cyan flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-4 rounded-2xl ${
                    isUser
                      ? "bg-cyber-cyan text-cyber-dark font-medium shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                      : "bg-cyber-card border border-cyber-border text-cyber-text shadow-md"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-cyber-sidebar border border-cyber-border text-cyber-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 text-xs justify-start">
              <div className="w-7 h-7 rounded-lg bg-cyber-card border border-cyber-cyan/50 text-cyber-cyan flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-cyber-card border border-cyber-border text-cyber-muted flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyber-cyan" />
                <span>Formulating cybersecurity response...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggested Prompts (Chips) */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 flex-shrink-0 no-scrollbar">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-cyber-card border border-cyber-border hover:border-cyber-cyan text-cyber-muted hover:text-cyber-cyan transition-colors whitespace-nowrap flex-shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 flex-shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a suspicious email, verify a payment request, or explain an attack..."
            className="flex-1 px-4 py-3 rounded-xl bg-cyber-sidebar border border-cyber-border text-xs text-cyber-text placeholder:text-cyber-muted/50 focus:outline-none focus:border-cyber-cyan"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl font-semibold text-xs bg-cyber-cyan text-cyber-dark hover:bg-cyan-400 disabled:opacity-50 transition-all shadow-[0_0_12px_rgba(34,211,238,0.25)] flex items-center gap-1.5"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </Sidebar>
  );
}

export default function AssistantPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-cyber-dark flex items-center justify-center text-cyber-muted text-sm">
          Loading CyberShield Assistant...
        </div>
      }
    >
      <AssistantContent />
    </React.Suspense>
  );
}

