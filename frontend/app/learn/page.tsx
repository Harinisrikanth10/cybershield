"use client";

import React, { useEffect, useState } from "react";
import {
  GraduationCap,
  Globe,
  Eye,
  Mic,
  AlertTriangle,
  KeyRound,
  ShieldAlert,
  QrCode,
  CreditCard,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  Search,
  X,
  Award,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { api } from "@/lib/api";
import { Course, Lesson, QuizQuestion, QuizResultResponse } from "@/types";

export default function LearnPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<"lessons" | "quiz">("lessons");

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResultResponse | null>(null);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await api.getCourses();
      setCourses(data);
    } catch (e) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const openCourse = async (course: Course) => {
    try {
      const fullCourse = await api.getCourseDetail(course.slug);
      setSelectedCourse(fullCourse);
      setActiveTab("lessons");
      setQuizAnswers({});
      setQuizResult(null);
    } catch (e) {
      // Ignore
    }
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    setQuizSubmitting(true);
    try {
      const res = await api.submitQuiz(selectedCourse.id, quizAnswers);
      setQuizResult(res);
      // Refresh list to update progress badges
      await loadCourses();
    } catch (e) {
      // Ignore
    } finally {
      setQuizSubmitting(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    if (!search.trim()) return true;
    return (
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    );
  });

  const getCourseIcon = (iconName: string) => {
    switch (iconName) {
      case "Globe":
        return <Globe className="w-5 h-5" />;
      case "Eye":
        return <Eye className="w-5 h-5" />;
      case "Mic":
        return <Mic className="w-5 h-5" />;
      case "KeyRound":
        return <KeyRound className="w-5 h-5" />;
      case "QrCode":
        return <QrCode className="w-5 h-5" />;
      case "CreditCard":
        return <CreditCard className="w-5 h-5" />;
      default:
        return <ShieldAlert className="w-5 h-5" />;
    }
  };

  const completedCount = courses.filter((c) => c.is_completed).length;

  return (
    <Sidebar>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-cyber-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-cyber-text tracking-tight flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-cyber-cyan" />
              <span>Cybersecurity Defense Academy</span>
            </h1>
            <p className="text-xs text-cyber-muted mt-1">
              Curated, practical defensive modules with real-world scenarios and interactive knowledge verification.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-4 py-2 rounded-xl bg-cyber-card border border-cyber-border text-xs text-cyber-text font-medium flex items-center gap-2">
              <Award className="w-4 h-4 text-cyber-cyan" />
              <span>
                Completed: <strong className="text-cyber-cyan">{completedCount}</strong> / {courses.length} Modules
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-cyber-muted absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search learning modules (phishing, deepfakes, passwords, quishing)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cyber-card border border-cyber-border text-xs text-cyber-text placeholder:text-cyber-muted/50 focus:outline-none focus:border-cyber-cyan"
          />
        </div>

        {/* Courses Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => openCourse(course)}
              className="p-5 rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/50 hover:bg-cyber-elevated/70 transition-all cursor-pointer flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-cyber-sidebar border border-cyber-border flex items-center justify-center text-cyber-cyan group-hover:scale-110 transition-transform">
                    {getCourseIcon(course.icon)}
                  </div>
                  {course.is_completed ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{Math.round(course.quiz_score || 100)}%</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-cyber-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>~{course.estimated_minutes} min</span>
                    </span>
                  )}
                </div>

                <span className="text-[10px] uppercase font-bold text-cyber-cyan tracking-wider">
                  {course.category}
                </span>
                <h3 className="text-sm font-bold text-cyber-text group-hover:text-cyber-cyan transition-colors mt-0.5">
                  {course.title}
                </h3>
                <p className="text-xs text-cyber-muted mt-2 leading-relaxed line-clamp-3">
                  {course.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-cyber-border/60 flex items-center justify-between text-xs font-semibold text-cyber-cyan">
                <span>{course.is_completed ? "Review Module" : "Start Lesson"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* Selected Course Learning Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-cyber-card border border-cyber-border rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
              {/* Modal Top Bar */}
              <div className="p-5 border-b border-cyber-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-cyber-cyan">
                    {selectedCourse.category}
                  </span>
                  <h2 className="text-lg font-bold text-cyber-text mt-0.5">{selectedCourse.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="p-1.5 rounded-lg text-cyber-muted hover:text-cyber-text bg-cyber-sidebar border border-cyber-border"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs: Lessons vs Quiz */}
              <div className="flex border-b border-cyber-border px-5 bg-cyber-sidebar/50">
                <button
                  onClick={() => setActiveTab("lessons")}
                  className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === "lessons"
                      ? "border-cyber-cyan text-cyber-cyan"
                      : "border-transparent text-cyber-muted hover:text-cyber-text"
                  }`}
                >
                  Lessons & Key Takeaways
                </button>
                <button
                  onClick={() => setActiveTab("quiz")}
                  className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === "quiz"
                      ? "border-cyber-cyan text-cyber-cyan"
                      : "border-transparent text-cyber-muted hover:text-cyber-text"
                  }`}
                >
                  <span>Interactive Quiz</span>
                  {selectedCourse.is_completed && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs leading-relaxed">
                {activeTab === "lessons" ? (
                  <div className="space-y-6">
                    {selectedCourse.lessons?.map((lesson) => (
                      <div key={lesson.id} className="space-y-3 pb-4 border-b border-cyber-border/60">
                        <h4 className="text-sm font-bold text-cyber-cyan">
                          {lesson.order_index}. {lesson.title}
                        </h4>
                        <p className="text-cyber-text/90 leading-relaxed whitespace-pre-line">
                          {lesson.content}
                        </p>

                        {lesson.key_takeaways?.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-cyber-sidebar border border-cyber-border space-y-1.5">
                            <span className="font-bold text-cyber-cyan uppercase text-[10px] tracking-wider">
                              Core Takeaways:
                            </span>
                            <ul className="list-disc list-inside space-y-1 text-cyber-muted">
                              {lesson.key_takeaways.map((takeaway, idx) => (
                                <li key={idx}>{takeaway}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="pt-2 text-right">
                      <button
                        onClick={() => setActiveTab("quiz")}
                        className="px-5 py-2.5 rounded-xl bg-cyber-cyan hover:bg-cyan-400 text-cyber-dark font-semibold text-xs inline-flex items-center gap-2"
                      >
                        <span>Take Interactive Quiz</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {quizResult ? (
                      <div className="space-y-6">
                        <div
                          className={`p-6 rounded-2xl text-center border ${
                            quizResult.passed
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          }`}
                        >
                          <div className="text-3xl font-extrabold font-mono mb-1">
                            {quizResult.score_percentage}%
                          </div>
                          <h4 className="text-sm font-bold text-cyber-text">
                            {quizResult.passed
                              ? "Passed! Module Knowledge Verified"
                              : "Review Recommended"}
                          </h4>
                          <p className="text-xs text-cyber-muted mt-1">
                            {quizResult.correct_count} of {quizResult.total_questions} questions answered correctly.
                          </p>
                        </div>

                        {/* Detailed question explanations */}
                        <div className="space-y-3">
                          {quizResult.details.map((item, idx) => (
                            <div
                              key={idx}
                              className={`p-4 rounded-xl border ${
                                item.is_correct
                                  ? "bg-cyber-sidebar border-emerald-500/30"
                                  : "bg-cyber-sidebar border-red-500/30"
                              }`}
                            >
                              <div className="flex items-center gap-2 font-bold text-xs text-cyber-text">
                                {item.is_correct ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <ShieldAlert className="w-4 h-4 text-red-400" />
                                )}
                                <span>{item.question}</span>
                              </div>
                              <p className="mt-2 text-cyber-muted text-xs">
                                <strong className="text-cyber-cyan">Explanation: </strong>
                                {item.explanation}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="text-center">
                          <button
                            onClick={() => {
                              setQuizResult(null);
                              setQuizAnswers({});
                            }}
                            className="px-4 py-2 rounded-xl bg-cyber-sidebar border border-cyber-border text-xs text-cyber-text hover:border-cyber-cyan"
                          >
                            Retake Quiz
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleQuizSubmit} className="space-y-6">
                        {selectedCourse.quizzes?.map((q, qIdx) => (
                          <div key={q.id} className="p-4 rounded-xl bg-cyber-sidebar border border-cyber-border space-y-3">
                            <h4 className="text-xs font-bold text-cyber-text">
                              {qIdx + 1}. {q.question}
                            </h4>
                            <div className="space-y-2">
                              {q.options.map((opt, optIdx) => (
                                <label
                                  key={optIdx}
                                  className={`flex items-center gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                                    quizAnswers[q.id] === optIdx
                                      ? "bg-cyber-card border-cyber-cyan text-cyber-cyan font-semibold"
                                      : "bg-cyber-dark/60 border-cyber-border text-cyber-muted hover:text-cyber-text"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={q.id}
                                    checked={quizAnswers[q.id] === optIdx}
                                    onChange={() =>
                                      setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                                    }
                                    className="hidden"
                                  />
                                  <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">
                                    {quizAnswers[q.id] === optIdx && (
                                      <span className="w-2 h-2 rounded-full bg-cyber-cyan" />
                                    )}
                                  </span>
                                  <span>{opt}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}

                        <div className="text-right">
                          <button
                            type="submit"
                            disabled={quizSubmitting || Object.keys(quizAnswers).length === 0}
                            className="px-6 py-2.5 rounded-xl bg-cyber-cyan hover:bg-cyan-400 text-cyber-dark font-semibold text-xs disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                          >
                            {quizSubmitting ? "Submitting..." : "Submit Answers"}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
