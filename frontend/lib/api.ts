import {
  User,
  AnalysisResponse,
  ReportDetailResponse,
  DashboardSummaryResponse,
  Alert,
  Course,
  QuizResultResponse,
  ChatMessage,
} from "@/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? "/api/v1"
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/api/v1`
    : "http://127.0.0.1:8000/api/v1");

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("cybershield_token");
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("cybershield_token", token);
      } else {
        localStorage.removeItem("cybershield_token");
      }
    }
  }

  public getToken(): string | null {
    if (!this.token && typeof window !== "undefined") {
      this.token = localStorage.getItem("cybershield_token");
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = new Headers(options.headers || {});

    const token = this.getToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const res = await fetch(url, config);

    if (res.status === 401) {
      this.setToken(null);
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register") && window.location.pathname !== "/") {
        window.location.href = "/login?expired=1";
      }
    }

    if (!res.ok) {
      let errorMsg = "An unexpected error occurred.";
      try {
        const errorData = await res.json();
        errorMsg = errorData.detail || errorData.message || errorMsg;
      } catch (e) {
        errorMsg = res.statusText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    return (await res.json()) as T;
  }

  // --- Auth Endpoints ---
  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const data = await this.request<{ access_token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async register(email: string, password: string, full_name?: string): Promise<{ access_token: string; user: User }> {
    const data = await this.request<{ access_token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.request("/auth/logout", { method: "POST" });
    } finally {
      this.setToken(null);
    }
  }

  async getMe(): Promise<User> {
    return this.request<User>("/auth/me");
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  // --- Dashboard ---
  async getDashboardSummary(): Promise<DashboardSummaryResponse> {
    return this.request<DashboardSummaryResponse>("/dashboard/summary");
  }

  // --- Threat Analysis Center ---
  async analyzeUrl(url: string, user_label?: string): Promise<AnalysisResponse> {
    return this.request<AnalysisResponse>("/analysis/url", {
      method: "POST",
      body: JSON.stringify({ url, user_label }),
    });
  }

  async analyzeText(text: string, context_type: string = "message", user_label?: string): Promise<AnalysisResponse> {
    return this.request<AnalysisResponse>("/analysis/text", {
      method: "POST",
      body: JSON.stringify({ text, context_type, user_label }),
    });
  }

  async analyzeFile(type: "image" | "audio" | "video", file: File): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append("file", file);
    return this.request<AnalysisResponse>(`/analysis/${type}`, {
      method: "POST",
      body: formData,
    });
  }

  async getAnalyses(params?: { search?: string; type?: string; risk?: string }): Promise<AnalysisResponse[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.type) query.set("type", params.type);
    if (params?.risk) query.set("risk", params.risk);
    return this.request<AnalysisResponse[]>(`/analysis?${query.toString()}`);
  }

  async getAnalysisById(id: string): Promise<ReportDetailResponse> {
    return this.request<ReportDetailResponse>(`/analysis/${id}`);
  }

  async deleteAnalysis(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/analysis/${id}`, {
      method: "DELETE",
    });
  }

  // --- Complete Threat Reports ---
  async getReport(id: string): Promise<ReportDetailResponse> {
    return this.request<ReportDetailResponse>(`/reports/${id}`);
  }

  async deleteReport(id: string): Promise<{ message: string }> {
    return this.deleteAnalysis(id);
  }

  async exportReportData(id: string): Promise<any> {
    return this.request<any>(`/reports/${id}/export`);
  }

  // --- Security Alerts ---
  async getAlerts(unreadOnly: boolean = false, severity?: string): Promise<Alert[]> {
    const query = new URLSearchParams();
    if (unreadOnly) query.set("unread_only", "true");
    if (severity) query.set("severity", severity);
    return this.request<Alert[]>(`/alerts?${query.toString()}`);
  }

  async markAlertRead(id: string, is_read: boolean = true): Promise<Alert> {
    return this.request<Alert>(`/alerts/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_read }),
    });
  }

  async markAllAlertsRead(): Promise<{ message: string }> {
    return this.request<{ message: string }>("/alerts/mark-all-read", {
      method: "POST",
    });
  }

  async deleteAlert(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/alerts/${id}`, {
      method: "DELETE",
    });
  }

  // --- AI Security Assistant ---
  async sendAssistantMessage(content: string, attached_report_id?: string): Promise<ChatMessage> {
    return this.request<ChatMessage>("/assistant/chat", {
      method: "POST",
      body: JSON.stringify({ content, attached_report_id }),
    });
  }

  async getAssistantHistory(): Promise<ChatMessage[]> {
    return this.request<ChatMessage[]>("/assistant/history");
  }

  async clearAssistantHistory(): Promise<{ message: string }> {
    return this.request<{ message: string }>("/assistant/history", {
      method: "DELETE",
    });
  }

  // --- Security Education ---
  async getCourses(): Promise<Course[]> {
    return this.request<Course[]>("/learn");
  }

  async getCourseDetail(slug: string): Promise<Course> {
    return this.request<Course>(`/learn/${slug}`);
  }

  async submitQuiz(course_id: string, answers: Record<string, number>): Promise<QuizResultResponse> {
    return this.request<QuizResultResponse>("/learn/quiz/submit", {
      method: "POST",
      body: JSON.stringify({ course_id, answers }),
    });
  }

  // --- Profile & Settings ---
  async updateProfile(data: { full_name?: string; theme?: string; notify_email?: boolean; notify_high_risk?: boolean }): Promise<User> {
    return this.request<User>("/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async exportProfileData(): Promise<any> {
    return this.request<any>("/profile/export", {
      method: "POST",
    });
  }

  async deleteAccount(): Promise<{ message: string }> {
    return this.request<{ message: string }>("/profile", {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient();
