import { NextRequest, NextResponse } from "next/server";
import { QuizResultResponse } from "@/types";
import {
  getState,
  coursesData,
  quizAnswers,
  analyzeUrlHeuristic,
  analyzeTextHeuristic,
  analyzeFileHeuristic,
  generateAssistantReply,
} from "../mock-data";

// Helper for proxying to external FastAPI backend if BACKEND_URL is set
async function tryProxyToExternalBackend(req: NextRequest, slug: string[]): Promise<Response | null> {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) return null;

  try {
    const url = new URL(req.url);
    const targetUrl = `${backendUrl.replace(/\/$/, "")}/api/v1/${slug.join("/")}${url.search}`;

    const headers = new Headers(req.headers);
    headers.delete("host");

    const body = req.method !== "GET" && req.method !== "HEAD" ? await req.blob() : undefined;

    const res = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      // @ts-ignore
      duplex: "half",
    });

    return res;
  } catch (err) {
    console.warn("External backend proxy failed, falling back to built-in serverless engine:", err);
    return null;
  }
}

// Handler for all GET requests
export async function GET(req: NextRequest, { params }: { params: { slug?: string[] } }) {
  const slug = params.slug || [];

  const proxied = await tryProxyToExternalBackend(req, slug);
  if (proxied) return proxied;

  const state = getState();
  const path = slug.join("/");

  // 1. Auth Me
  if (path === "auth/me") {
    return NextResponse.json(state.user);
  }

  // 2. Dashboard Summary
  if (path === "dashboard/summary") {
    const total = state.analyses.length;
    const critical = state.analyses.filter((a) => a.risk_category === "Critical").length;
    const high = state.analyses.filter((a) => a.risk_category === "High").length;
    const medium = state.analyses.filter((a) => a.risk_category === "Moderate").length;
    const low = state.analyses.filter((a) => a.risk_category === "Low").length;
    const unread = state.alerts.filter((a) => !a.is_read).length;

    const categoryDistribution = {
      url: state.analyses.filter((a) => a.submission_type === "url").length,
      text: state.analyses.filter((a) => a.submission_type === "text").length,
      image: state.analyses.filter((a) => a.submission_type === "image").length,
      audio: state.analyses.filter((a) => a.submission_type === "audio").length,
      video: state.analyses.filter((a) => a.submission_type === "video").length,
    };

    const recentActivity = state.analyses.slice(0, 5).map((a) => ({
      id: a.id,
      submission_type: a.submission_type,
      target_summary: a.target_summary,
      risk_score: a.risk_score,
      risk_category: a.risk_category,
      status: a.status,
      created_at: a.created_at,
    }));

    const securityTips = [
      {
        id: "tip-1",
        title: "Always Inspect Root Domains",
        category: "Web Browsing",
        tip: "Read URLs from right to left before the first single slash to uncover hidden subdomains.",
        severity: "medium",
      },
      {
        id: "tip-2",
        title: "Zero-Trust Urgency Protocol",
        category: "Social Engineering",
        tip: "Any unexpected email with a short deadline is a prime red flag for CEO wire fraud.",
        severity: "high",
      },
      {
        id: "tip-3",
        title: "Passkey & FIDO2 Adoption",
        category: "Identity Protection",
        tip: "Phishing-resistant hardware keys prevent credential harvesting kits from stealing active tokens.",
        severity: "low",
      },
    ];

    return NextResponse.json({
      total_analyses: total,
      high_risk_items: high,
      medium_risk_items: medium,
      low_risk_items: low,
      critical_risk_items: critical,
      unread_alerts_count: unread,
      risk_distribution: { low, medium, high, critical },
      category_distribution: categoryDistribution,
      recent_activity: recentActivity,
      security_tips: securityTips,
    });
  }

  // 3. Analysis List & Item
  if (slug[0] === "analysis") {
    if (slug.length === 1) {
      // GET /analysis
      const search = req.nextUrl.searchParams.get("search")?.toLowerCase();
      const type = req.nextUrl.searchParams.get("type");
      const risk = req.nextUrl.searchParams.get("risk");

      let filtered = [...state.analyses];
      if (search) {
        filtered = filtered.filter((a) => a.target_summary.toLowerCase().includes(search));
      }
      if (type && type !== "all") {
        filtered = filtered.filter((a) => a.submission_type === type);
      }
      if (risk && risk !== "all") {
        filtered = filtered.filter((a) => a.risk_category.toLowerCase() === risk.toLowerCase());
      }
      return NextResponse.json(filtered);
    } else {
      // GET /analysis/:id
      const id = slug[1];
      const found = state.analyses.find((a) => a.id === id);
      if (found) {
        return NextResponse.json({
          ...found,
          raw_input_preview: found.target_summary,
          user_id: state.user.id,
        });
      }
      return NextResponse.json({ detail: "Analysis report not found" }, { status: 404 });
    }
  }

  // 4. Reports Detail & Export
  if (slug[0] === "reports") {
    const id = slug[1];
    const isExport = slug[2] === "export";
    const found = state.analyses.find((a) => a.id === id);
    if (!found) {
      return NextResponse.json({ detail: "Report not found" }, { status: 404 });
    }
    if (isExport) {
      return NextResponse.json({
        export_version: "1.0",
        platform: "CyberShield AI",
        report: found,
        exported_at: new Date().toISOString(),
      });
    }
    return NextResponse.json({
      ...found,
      raw_input_preview: found.target_summary,
      user_id: state.user.id,
    });
  }

  // 5. Alerts
  if (slug[0] === "alerts") {
    const unreadOnly = req.nextUrl.searchParams.get("unread_only") === "true";
    const severity = req.nextUrl.searchParams.get("severity");

    let alerts = [...state.alerts];
    if (unreadOnly) alerts = alerts.filter((a) => !a.is_read);
    if (severity) alerts = alerts.filter((a) => a.severity.toLowerCase() === severity.toLowerCase());

    return NextResponse.json(alerts);
  }

  // 6. Assistant History
  if (path === "assistant/history") {
    return NextResponse.json(state.assistantMessages);
  }

  // 7. Learn Courses
  if (slug[0] === "learn") {
    if (slug.length === 1) {
      // GET /learn
      const coursesWithProgress = coursesData.map((c) => ({
        ...c,
        is_completed: state.courseProgress[c.id]?.completed || false,
        quiz_score: state.courseProgress[c.id]?.score,
      }));
      return NextResponse.json(coursesWithProgress);
    } else {
      // GET /learn/:slug
      const courseSlug = slug[1];
      const course = coursesData.find((c) => c.slug === courseSlug);
      if (course) {
        return NextResponse.json({
          ...course,
          is_completed: state.courseProgress[course.id]?.completed || false,
          quiz_score: state.courseProgress[course.id]?.score,
        });
      }
      return NextResponse.json({ detail: "Course not found" }, { status: 404 });
    }
  }

  return NextResponse.json({ detail: "Endpoint not found" }, { status: 404 });
}

// Handler for all POST requests
export async function POST(req: NextRequest, { params }: { params: { slug?: string[] } }) {
  const slug = params.slug || [];

  const proxied = await tryProxyToExternalBackend(req, slug);
  if (proxied) return proxied;

  const state = getState();
  const path = slug.join("/");

  // 1. Auth Login
  if (path === "auth/login") {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ detail: "Email and password are required" }, { status: 400 });
    }

    const token = `cs_jwt_${Buffer.from(JSON.stringify({ email, time: Date.now() })).toString("base64")}`;
    state.user.email = email;
    if (email.includes("@")) {
      state.user.full_name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
    }

    return NextResponse.json({
      access_token: token,
      token_type: "bearer",
      user: state.user,
    });
  }

  // 2. Auth Register
  if (path === "auth/register") {
    const body = await req.json().catch(() => ({}));
    const { email, password, full_name } = body;

    if (!email || !password) {
      return NextResponse.json({ detail: "Email and password are required" }, { status: 400 });
    }

    const token = `cs_jwt_${Buffer.from(JSON.stringify({ email, time: Date.now() })).toString("base64")}`;
    state.user.email = email;
    state.user.full_name = full_name || "CyberShield User";

    return NextResponse.json({
      access_token: token,
      token_type: "bearer",
      user: state.user,
    });
  }

  // 3. Auth Logout
  if (path === "auth/logout") {
    return NextResponse.json({ message: "Successfully logged out" });
  }

  // 4. Auth Forgot Password
  if (path === "auth/forgot-password") {
    return NextResponse.json({
      message: "If an account matches that email address, password reset instructions have been dispatched.",
    });
  }

  // 5. Threat Analysis: URL
  if (path === "analysis/url") {
    const body = await req.json().catch(() => ({}));
    if (!body.url) {
      return NextResponse.json({ detail: "URL is required" }, { status: 400 });
    }
    const result = analyzeUrlHeuristic(body.url, body.user_label);
    return NextResponse.json(result);
  }

  // 6. Threat Analysis: Text
  if (path === "analysis/text") {
    const body = await req.json().catch(() => ({}));
    if (!body.text) {
      return NextResponse.json({ detail: "Text is required" }, { status: 400 });
    }
    const result = analyzeTextHeuristic(body.text, body.context_type, body.user_label);
    return NextResponse.json(result);
  }

  // 7. Threat Analysis: Files (image, audio, video)
  if (slug[0] === "analysis" && ["image", "audio", "video"].includes(slug[1])) {
    const fileType = slug[1] as "image" | "audio" | "video";
    const formData = await req.formData().catch(() => null);
    const file = formData ? (formData.get("file") as File) : null;

    const filename = file?.name || `sample_${fileType}_upload.bin`;
    const size = file?.size || 1024 * 128;

    const result = analyzeFileHeuristic(filename, fileType, size);
    return NextResponse.json(result);
  }

  // 8. Assistant Chat
  if (path === "assistant/chat") {
    const body = await req.json().catch(() => ({}));
    const { content, attached_report_id } = body;

    if (!content) {
      return NextResponse.json({ detail: "Message content is required" }, { status: 400 });
    }

    const userMsg = {
      id: `msg-u-${Date.now()}`,
      role: "user" as const,
      content,
      attached_report_id,
      created_at: new Date().toISOString(),
    };
    state.assistantMessages.push(userMsg);

    const replyText = generateAssistantReply(content, attached_report_id);
    const assistantMsg = {
      id: `msg-a-${Date.now()}`,
      role: "assistant" as const,
      content: replyText,
      attached_report_id,
      created_at: new Date().toISOString(),
    };
    state.assistantMessages.push(assistantMsg);

    return NextResponse.json(assistantMsg);
  }

  // 9. Alerts Mark All Read
  if (path === "alerts/mark-all-read") {
    state.alerts.forEach((a) => {
      a.is_read = true;
    });
    return NextResponse.json({ message: "All alerts marked as read" });
  }

  // 10. Learn Quiz Submit
  if (path === "learn/quiz/submit") {
    const body = await req.json().catch(() => ({}));
    const { course_id, answers } = body; // answers is Record<string, number>

    let correctCount = 0;
    const details = [];

    const answerKeys = Object.keys(answers || {});
    const totalQuestions = answerKeys.length || 1;

    for (const qId of answerKeys) {
      const userAnswer = answers[qId];
      const standard = quizAnswers[qId] || { answer: 0, explanation: "Standard security protocol guidance applies." };
      const isCorrect = userAnswer === standard.answer;
      if (isCorrect) correctCount++;

      details.push({
        question_id: qId,
        question: "Security Assessment Question",
        user_answer: userAnswer,
        correct_answer: standard.answer,
        is_correct: isCorrect,
        explanation: standard.explanation,
      });
    }

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercentage >= 70;

    state.courseProgress[course_id] = {
      completed: passed,
      score: scorePercentage,
    };

    const response: QuizResultResponse = {
      course_id,
      score_percentage: scorePercentage,
      passed,
      total_questions: totalQuestions,
      correct_count: correctCount,
      details,
    };

    return NextResponse.json(response);
  }

  // 11. Profile Export
  if (path === "profile/export") {
    return NextResponse.json({
      profile: state.user,
      analyses_count: state.analyses.length,
      alerts_count: state.alerts.length,
      exported_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ detail: "Endpoint not found" }, { status: 404 });
}

// Handler for PATCH requests
export async function PATCH(req: NextRequest, { params }: { params: { slug?: string[] } }) {
  const slug = params.slug || [];

  const proxied = await tryProxyToExternalBackend(req, slug);
  if (proxied) return proxied;

  const state = getState();

  // 1. Alerts Mark Read
  if (slug[0] === "alerts" && slug.length === 2) {
    const id = slug[1];
    const body = await req.json().catch(() => ({}));
    const found = state.alerts.find((a) => a.id === id);
    if (found) {
      if (typeof body.is_read === "boolean") {
        found.is_read = body.is_read;
      }
      return NextResponse.json(found);
    }
    return NextResponse.json({ detail: "Alert not found" }, { status: 404 });
  }

  // 2. Profile Update
  if (slug.join("/") === "profile") {
    const body = await req.json().catch(() => ({}));
    if (body.full_name) state.user.full_name = body.full_name;
    if (body.theme) state.user.theme = body.theme;
    if (typeof body.notify_email === "boolean") state.user.notify_email = body.notify_email;
    if (typeof body.notify_high_risk === "boolean") state.user.notify_high_risk = body.notify_high_risk;

    return NextResponse.json(state.user);
  }

  return NextResponse.json({ detail: "Endpoint not found" }, { status: 404 });
}

// Handler for DELETE requests
export async function DELETE(req: NextRequest, { params }: { params: { slug?: string[] } }) {
  const slug = params.slug || [];

  const proxied = await tryProxyToExternalBackend(req, slug);
  if (proxied) return proxied;

  const state = getState();

  // 1. Delete Analysis
  if (slug[0] === "analysis" && slug.length === 2) {
    const id = slug[1];
    state.analyses = state.analyses.filter((a) => a.id !== id);
    return NextResponse.json({ message: "Analysis removed" });
  }

  // 2. Delete Alert
  if (slug[0] === "alerts" && slug.length === 2) {
    const id = slug[1];
    state.alerts = state.alerts.filter((a) => a.id !== id);
    return NextResponse.json({ message: "Alert removed" });
  }

  // 3. Clear Assistant History
  if (slug.join("/") === "assistant/history") {
    state.assistantMessages = [];
    return NextResponse.json({ message: "Conversation history cleared" });
  }

  // 4. Delete Account
  if (slug.join("/") === "profile") {
    return NextResponse.json({ message: "Account deleted" });
  }

  return NextResponse.json({ detail: "Endpoint not found" }, { status: 404 });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
