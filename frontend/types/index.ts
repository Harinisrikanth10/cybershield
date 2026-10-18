export type RiskSeverity = "low" | "medium" | "high" | "critical";

export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_admin: boolean;
  role: string;
  theme: string;
  notify_email: boolean;
  notify_high_risk: boolean;
  created_at: string;
}

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: RiskSeverity;
  category: string;
  confidence: number;
}

export interface EvidenceItem {
  signal_name: string;
  observation: string;
  raw_value?: string;
  impact: "positive" | "neutral" | "negative";
}

export interface Recommendation {
  action: string;
  priority: "urgent" | "high" | "recommended" | "informational";
  detail: string;
}

export interface AnalysisResponse {
  id: string;
  submission_type: "url" | "text" | "image" | "audio" | "video";
  target_summary: string;
  risk_score: number;
  risk_category: "Low" | "Moderate" | "High" | "Critical";
  confidence_score: number;
  status: "completed" | "limited" | "failed";
  findings: Finding[];
  evidence: EvidenceItem[];
  limitations: string[];
  recommendations: Recommendation[];
  model_info: Record<string, any>;
  created_at: string;
}

export interface ReportDetailResponse extends AnalysisResponse {
  raw_input_preview?: string;
  user_id: string;
}

export interface RecentActivityItem {
  id: string;
  submission_type: string;
  target_summary: string;
  risk_score: number;
  risk_category: string;
  status: string;
  created_at: string;
}

export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface CategoryDistribution {
  url: number;
  text: number;
  image: number;
  audio: number;
  video: number;
}

export interface SecurityTip {
  id: string;
  title: string;
  category: string;
  tip: string;
  severity: string;
}

export interface DashboardSummaryResponse {
  total_analyses: number;
  high_risk_items: number;
  medium_risk_items: number;
  low_risk_items: number;
  critical_risk_items: number;
  unread_alerts_count: number;
  risk_distribution: RiskDistribution;
  category_distribution: CategoryDistribution;
  recent_activity: RecentActivityItem[];
  security_tips: SecurityTip[];
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: RiskSeverity;
  is_read: boolean;
  analysis_id?: string;
  created_at: string;
}

export interface Lesson {
  id: string;
  order_index: number;
  title: string;
  content: string;
  key_takeaways: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  estimated_minutes: number;
  lessons_count: number;
  is_completed: boolean;
  quiz_score?: number;
  lessons?: Lesson[];
  quizzes?: QuizQuestion[];
}

export interface QuizQuestionResult {
  question_id: string;
  question: string;
  user_answer: number;
  correct_answer: number;
  is_correct: boolean;
  explanation: string;
}

export interface QuizResultResponse {
  course_id: string;
  score_percentage: number;
  passed: boolean;
  total_questions: number;
  correct_count: number;
  details: QuizQuestionResult[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  attached_report_id?: string;
  created_at: string;
}
