import {
  AnalysisResponse,
  Alert,
  Course,
  DashboardSummaryResponse,
  QuizResultResponse,
  User,
  ChatMessage,
  Finding,
  EvidenceItem,
  Recommendation,
} from "@/types";

export interface StoredState {
  user: User;
  analyses: AnalysisResponse[];
  alerts: Alert[];
  assistantMessages: ChatMessage[];
  courseProgress: Record<string, { completed: boolean; score?: number }>;
}

export const initialUser: User = {
  id: "usr_demo_2026",
  email: "demo@cybershield.ai",
  full_name: "CyberShield Security Analyst",
  is_admin: true,
  role: "security_analyst",
  theme: "dark",
  notify_email: true,
  notify_high_risk: true,
  created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
};

export const initialAlerts: Alert[] = [
  {
    id: "alt-01",
    title: "Suspicious Credential Harvester Detected",
    message: "Inspection of URL 'https://microsoft.com.account-verify.xyz' flagged critical typosquatting mimicking Microsoft 365 login portals.",
    severity: "critical",
    is_read: false,
    analysis_id: "rep-01",
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "alt-02",
    title: "Urgent Wire Fraud Pretexting Signal",
    message: "Email body flagged with 88% probability of CEO Fraud / Business Email Compromise requesting swift wire disbursement.",
    severity: "high",
    is_read: false,
    analysis_id: "rep-02",
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: "alt-03",
    title: "Synthetic Audio Voice Sample Identified",
    message: "Spectral analysis detected acoustic synthetic prosody anomalies consistent with ElevenLabs diffusion vocoders.",
    severity: "medium",
    is_read: false,
    analysis_id: "rep-03",
    created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
  },
  {
    id: "alt-04",
    title: "Routine Defense Policy Completed",
    message: "Weekly automated DNS and SSL certificate baseline audit completed without discrepancies.",
    severity: "low",
    is_read: true,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

export const initialAnalyses: AnalysisResponse[] = [
  {
    id: "rep-01",
    submission_type: "url",
    target_summary: "https://microsoft.com.account-verify.xyz/auth/login",
    risk_score: 92,
    risk_category: "Critical",
    confidence_score: 96,
    status: "completed",
    findings: [
      {
        id: "f-1",
        title: "Subdomain Typosquatting Deception",
        description: "The subdomain 'microsoft.com' precedes the malicious host 'account-verify.xyz', a common kit technique.",
        severity: "critical",
        category: "Domain Spoofing",
        confidence: 0.98,
      },
      {
        id: "f-2",
        title: "High-Risk Untrusted TLD (.xyz)",
        description: "Top-level domain '.xyz' has high correlation with disposable credential harvesting campaigns.",
        severity: "high",
        category: "Infrastructure",
        confidence: 0.92,
      },
      {
        id: "f-3",
        title: "Credential Interception Form",
        description: "HTML structure contains login action attributes routing credentials to an unverified Russian federation server.",
        severity: "critical",
        category: "Credential Harvesting",
        confidence: 0.95,
      },
    ],
    evidence: [
      {
        signal_name: "Host Identity",
        observation: "Actual root host is 'account-verify.xyz', not 'microsoft.com'",
        impact: "negative",
      },
      {
        signal_name: "Certificate Issuer",
        observation: "Let's Encrypt short-lived DV certificate issued 18 hours ago",
        impact: "negative",
      },
      {
        signal_name: "Threat Feed Matches",
        observation: "Listed on PhishTank and OpenPhish active blocklists",
        impact: "negative",
      },
    ],
    limitations: ["Dynamic JavaScript execution sandboxed for 15 seconds."],
    recommendations: [
      {
        action: "Block Domain Immediately",
        priority: "urgent",
        detail: "Add '*.account-verify.xyz' to company firewall and DNS RPZ blocklists.",
      },
      {
        action: "Revoke Exposed Credentials",
        priority: "high",
        detail: "Force reset any session tokens or passwords entered by employees within the last 24h.",
      },
      {
        action: "Submit Anti-Phishing Report",
        priority: "recommended",
        detail: "Report host to registrar Namecheap abuse team and Google Safe Browsing.",
      },
    ],
    model_info: {
      engine: "CyberShield Multi-Signal Ensemble 2.4",
      tld_entropy: 4.82,
      reputation_db: "ThreatFeed-V12",
    },
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "rep-02",
    submission_type: "text",
    target_summary: "URGENT: Outstanding Invoice #98412 - Immediate Wire Transfer Required",
    risk_score: 84,
    risk_category: "High",
    confidence_score: 91,
    status: "completed",
    findings: [
      {
        id: "f-4",
        title: "Artificial Urgency & Deadline Coercion",
        description: "Message applies intense psychological pressure demanding action within 60 minutes under penalty threats.",
        severity: "high",
        category: "Social Engineering",
        confidence: 0.94,
      },
      {
        id: "f-5",
        title: "Direct Wire Instruction Anomaly",
        description: "Contains overseas bank routing instructions inconsistent with normal vendor ledger.",
        severity: "critical",
        category: "Financial Fraud",
        confidence: 0.89,
      },
    ],
    evidence: [
      {
        signal_name: "Sentiment & Tone",
        observation: "High coercive urgency keywords detected (deadline, penalty, wire now)",
        impact: "negative",
      },
      {
        signal_name: "Sender Verification",
        observation: "DKIM signature failed; reply-to domain differs from display domain",
        impact: "negative",
      },
    ],
    limitations: ["Source mail server headers partially truncated in paste."],
    recommendations: [
      {
        action: "Verify via Secondary Channel",
        priority: "urgent",
        detail: "Do not reply to this email. Call the vendor contact using their existing internal number.",
      },
      {
        action: "Flag Internal Mail Gateway",
        priority: "high",
        detail: "Create transport rule to quarantine similar subject lines across all mailboxes.",
      },
    ],
    model_info: {
      engine: "CyberShield NLP Pretexting Classifier",
      sentiment_score: -0.78,
      urgency_index: 0.91,
    },
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: "rep-03",
    submission_type: "audio",
    target_summary: "voicemail_urgent_wire_approval.wav (Audio forensics)",
    risk_score: 68,
    risk_category: "High",
    confidence_score: 87,
    status: "completed",
    findings: [
      {
        id: "f-6",
        title: "Neural Vocoder Acoustic Artifacts",
        description: "Frequency spectrogram reveals phase inconsistencies typical of synthetic text-to-speech models.",
        severity: "high",
        category: "Voice Cloning",
        confidence: 0.88,
      },
      {
        id: "f-7",
        title: "Abnormal Breathing & Pause Intervals",
        description: "Zero natural aspiration pauses detected between rapid sentences.",
        severity: "medium",
        category: "Biometric Forensics",
        confidence: 0.85,
      },
    ],
    evidence: [
      {
        signal_name: "Spectrogram Continuity",
        observation: "Synthetic boundary gaps observed at 2.4kHz and 4.1kHz harmonics",
        impact: "negative",
      },
      {
        signal_name: "Ambient Background",
        observation: "Artificial room reverb overlay does not match mic pickup pattern",
        impact: "negative",
      },
    ],
    limitations: ["Audio length under 15 seconds; confidence is moderate-high."],
    recommendations: [
      {
        action: "Deploy Verbal Family / Corporate Code",
        priority: "urgent",
        detail: "Request the caller verify themselves with pre-shared verbal passphrase.",
      },
      {
        action: "Do Not Authorize Funds",
        priority: "urgent",
        detail: "Halt all wire requests originating from audio or voicemail requests.",
      },
    ],
    model_info: {
      engine: "CyberShield Audio Forensic Neural Suite",
      jitter_analysis: "Synthetic",
      spectral_centroid_variance: 0.12,
    },
    created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
  },
  {
    id: "rep-04",
    submission_type: "url",
    target_summary: "https://github.com/torvalds/linux",
    risk_score: 6,
    risk_category: "Low",
    confidence_score: 99,
    status: "completed",
    findings: [
      {
        id: "f-8",
        title: "Verified Legitimate Domain",
        description: "Domain matches official GitHub infrastructure with strict EV certificate and CAA records.",
        severity: "low",
        category: "Reputation",
        confidence: 0.99,
      },
    ],
    evidence: [
      {
        signal_name: "Domain Age",
        observation: "Domain registered in 2007 (19 years of continuous history)",
        impact: "positive",
      },
      {
        signal_name: "TLS / HSTS",
        observation: "Strict Transport Security (HSTS) with preloading enabled",
        impact: "positive",
      },
    ],
    limitations: [],
    recommendations: [
      {
        action: "No Action Required",
        priority: "informational",
        detail: "Target resource is verified and safe for standard access.",
      },
    ],
    model_info: {
      engine: "CyberShield Threat Intelligence Base",
      reputation: "Safe",
    },
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
];

export const coursesData: Course[] = [
  {
    id: "c-1",
    slug: "phishing-and-urls",
    title: "Phishing & URL Deception",
    category: "Web Safety",
    description: "Master techniques to identify deceptive subdomains, homograph tricks, and credential harvesting kits.",
    icon: "Globe",
    estimated_minutes: 6,
    lessons_count: 2,
    is_completed: false,
    lessons: [
      {
        id: "l-1",
        order_index: 1,
        title: "Deconstruct Malicious URLs",
        content: "Phishers abuse subdomains to make URLs look official. For example, `https://paypal.com.verify-billing.xyz/` actually leads to `verify-billing.xyz`, NOT PayPal. Always read the domain starting from the first single forward slash `/` backwards to find the true root domain.",
        key_takeaways: [
          "The true domain is the last two labels before the first single slash.",
          "HTTPS encryption does not mean a site is verified or safe.",
          "Shortened URLs conceal target landing pages.",
        ],
      },
      {
        id: "l-2",
        order_index: 2,
        title: "Credential Harvesting Kits",
        content: "Phishing kits replicate official login screens with pixel-perfect accuracy. Look for mismatched domains, lack of browser autofill recognition, and unprompted requests for secondary credentials like ATM PINs or mother's maiden name.",
        key_takeaways: [
          "Password managers will refuse to autofill on spoofed domains.",
          "Legitimate institutions will never ask for your PIN via web form.",
        ],
      },
    ],
    quizzes: [
      {
        id: "q-1",
        question: "Which domain is the actual host in 'https://microsoft.com.account-update.top/login'?",
        options: ["microsoft.com", "account-update.top", "login", "None of the above"],
      },
      {
        id: "q-2",
        question: "Does having a valid padlock icon (HTTPS) guarantee a website is legitimate?",
        options: [
          "Yes, it proves the business is vetted",
          "No, HTTPS only encrypts the connection in transit",
          "Yes, if it has a .com domain",
          "Only on mobile devices",
        ],
      },
    ],
  },
  {
    id: "c-2",
    slug: "deepfakes-and-synthetic-media",
    title: "Deepfakes & Synthetic Media",
    category: "Media Forensics",
    description: "Learn visual artifact analysis, spatial-temporal inconsistencies, and generative AI boundaries.",
    icon: "Eye",
    estimated_minutes: 8,
    lessons_count: 1,
    is_completed: false,
    lessons: [
      {
        id: "l-3",
        order_index: 1,
        title: "Visual Artifacts in Deepfake Videos",
        content: "Neural face-swapping often introduces subtle boundary glitches along the jawline, around the ears, and in eye reflections (specular highlights). Look for erratic blinking patterns and lighting mismatches between the face and background.",
        key_takeaways: [
          "Observe lighting angles in eye reflections.",
          "Check for edge blurring when objects pass in front of faces.",
          "Notice unnatural teeth texture or jewelry distortion.",
        ],
      },
    ],
    quizzes: [
      {
        id: "q-3",
        question: "What is a common visual indicator of synthetic face generation?",
        options: [
          "Inconsistent specular highlights in the eyes",
          "4K resolution video",
          "Stereo audio",
          "Natural pupil dilation",
        ],
      },
    ],
  },
  {
    id: "c-3",
    slug: "voice-cloning-scams",
    title: "Voice-Cloning & Audio Scams",
    category: "Audio Safety",
    description: "Protect yourself and your organization against AI CEO fraud and urgent family emergency voice impersonations.",
    icon: "Mic",
    estimated_minutes: 5,
    lessons_count: 1,
    is_completed: false,
    lessons: [
      {
        id: "l-4",
        order_index: 1,
        title: "The Anatomy of a Vishing Call",
        content: "Attackers can clone a human voice using as little as 3 seconds of reference audio harvested from social media or webinars. They use this in high-stakes phone calls demanding emergency bail money or wire approvals.",
        key_takeaways: [
          "Establish a secret verbal family password.",
          "Hang up and call the person back on their verified number.",
          "Listen for robotic prosody and lack of breath sounds.",
        ],
      },
    ],
    quizzes: [
      {
        id: "q-4",
        question: "If you receive an urgent phone call from an executive or relative demanding funds, what is the best first step?",
        options: [
          "Wire the funds immediately",
          "Hang up and call them back on their known number",
          "Ask them for their credit card",
          "Reply with an SMS",
        ],
      },
    ],
  },
  {
    id: "c-4",
    slug: "social-engineering-tactics",
    title: "Social Engineering & Pretexting",
    category: "Defense Fundamentals",
    description: "Understand psychological manipulation, authority bias, and artificial urgency triggers.",
    icon: "AlertTriangle",
    estimated_minutes: 7,
    lessons_count: 1,
    is_completed: false,
    lessons: [
      {
        id: "l-5",
        order_index: 1,
        title: "The Urgency Manipulation Loop",
        content: "Scammers manufacture artificial crises ('Arrest warrant issued', 'Tax audit pending') to induce anxiety, which impairs rational decision making.",
        key_takeaways: [
          "High urgency is the #1 red flag in unsolicited communications.",
          "Government agencies do not notify you of arrest warrants via text message.",
        ],
      },
    ],
    quizzes: [
      {
        id: "q-5",
        question: "Why do attackers apply artificial deadlines in phishing emails?",
        options: [
          "To speed up email delivery queues",
          "To induce anxiety and impair critical verification",
          "To save mail server storage",
          "Because bank servers close at 5 PM",
        ],
      },
    ],
  },
];

export const quizAnswers: Record<string, { answer: number; explanation: string }> = {
  "q-1": {
    answer: 1,
    explanation: "In hierarchical domain structure, the host is determined by the last two segments before the path slash. 'microsoft.com' is merely a misleading subdomain in 'account-update.top'.",
  },
  "q-2": {
    answer: 1,
    explanation: "HTTPS encrypts data in transit between browser and server. Attackers easily obtain free SSL certificates for fraudulent domains.",
  },
  "q-3": {
    answer: 0,
    explanation: "Synthetic diffusion and GAN models often render mismatched reflections in the left and right eyes due to independent generative processing.",
  },
  "q-4": {
    answer: 1,
    explanation: "Always verify unexpected emergency financial requests through an independent, pre-established communications channel.",
  },
  "q-5": {
    answer: 1,
    explanation: "Scammers manufacture artificial panic to bypass deliberate reasoning and prevent independent verification.",
  },
};

// Global in-memory storage for serverless runtime
let state: StoredState = {
  user: { ...initialUser },
  analyses: [...initialAnalyses],
  alerts: [...initialAlerts],
  assistantMessages: [],
  courseProgress: {},
};

export function getState(): StoredState {
  return state;
}

export function analyzeUrlHeuristic(url: string, user_label?: string): AnalysisResponse {
  let riskScore = 15;
  const findings: Finding[] = [];
  const evidence: EvidenceItem[] = [];
  const recommendations: Recommendation[] = [];

  let parsed: URL;
  try {
    parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
  } catch (e) {
    parsed = new URL("https://unknown-domain.invalid");
  }

  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname.toLowerCase();

  // Suspicious TLD check
  const suspiciousTlds = [".xyz", ".top", ".buzz", ".club", ".work", ".cn", ".ru", ".link", ".live", ".click", ".gq", ".cf", ".tk", ".ml"];
  const matchedTld = suspiciousTlds.find((tld) => hostname.endsWith(tld));
  if (matchedTld) {
    riskScore += 35;
    findings.push({
      id: `f-${Date.now()}-1`,
      title: `High-Risk TLD Detected (${matchedTld})`,
      description: `Domain uses '${matchedTld}' which is statistically overrepresented in disposable phishing campaigns.`,
      severity: "high",
      category: "Infrastructure",
      confidence: 0.92,
    });
    evidence.push({
      signal_name: "Top-Level Domain",
      observation: `Host ends with untrusted suffix ${matchedTld}`,
      impact: "negative",
    });
  }

  // Deceptive brands check
  const brands = ["paypal", "microsoft", "apple", "google", "netflix", "chase", "bankofamerica", "amazon", "wellsfargo", "metamask", "coinbase"];
  const matchedBrand = brands.find((brand) => hostname.includes(brand) && !hostname.endsWith(`${brand}.com`));
  if (matchedBrand) {
    riskScore += 45;
    findings.push({
      id: `f-${Date.now()}-2`,
      title: `Brand Impersonation / Typosquatting (${matchedBrand})`,
      description: `Domain contains reference to '${matchedBrand}' but does not belong to the authentic organization domain.`,
      severity: "critical",
      category: "Domain Spoofing",
      confidence: 0.97,
    });
    evidence.push({
      signal_name: "Brand Analysis",
      observation: `Unauthorized brand keyword '${matchedBrand}' found in subdomain/hostname`,
      impact: "negative",
    });
  }

  // Suspicious keywords
  const suspiciousKeywords = ["login", "signin", "verify", "secure", "account", "update", "banking", "wallet", "recovery", "auth", "billing"];
  const matchedKeyword = suspiciousKeywords.find((kw) => pathname.includes(kw) || hostname.includes(kw));
  if (matchedKeyword) {
    riskScore += 20;
    findings.push({
      id: `f-${Date.now()}-3`,
      title: `Credential Harvesting Keyword ('${matchedKeyword}')`,
      description: `URL path or host requests authentication or security verification, common in phishing traps.`,
      severity: "high",
      category: "Credential Harvesting",
      confidence: 0.88,
    });
  }

  // IP Address as host
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    riskScore += 40;
    findings.push({
      id: `f-${Date.now()}-4`,
      title: "Raw IP Address Host",
      description: "URL routes directly to a bare numeric IP rather than a registered, reputational domain name.",
      severity: "critical",
      category: "Host Anomaly",
      confidence: 0.95,
    });
  }

  // HTTP unencrypted
  if (parsed.protocol === "http:") {
    riskScore += 15;
    findings.push({
      id: `f-${Date.now()}-5`,
      title: "Unencrypted Connection (Plaintext HTTP)",
      description: "Site does not use TLS encryption; credentials transmitted can be intercepted on open networks.",
      severity: "medium",
      category: "Transport Security",
      confidence: 0.99,
    });
  }

  // Cap score
  riskScore = Math.min(Math.max(riskScore, 5), 98);

  // Classify severity
  let riskCategory: "Low" | "Moderate" | "High" | "Critical" = "Low";
  if (riskScore >= 75) riskCategory = "Critical";
  else if (riskScore >= 50) riskCategory = "High";
  else if (riskScore >= 25) riskCategory = "Moderate";

  if (findings.length === 0) {
    findings.push({
      id: `f-${Date.now()}-safe`,
      title: "No Immediate Deception Markers",
      description: "Domain reputation and structure appear consistent with legitimate web standards.",
      severity: "low",
      category: "Reputation",
      confidence: 0.95,
    });
    evidence.push({
      signal_name: "Structure Analysis",
      observation: "Domain structure conforms to recognized naming conventions",
      impact: "positive",
    });
    recommendations.push({
      action: "Standard Browsing Caution",
      priority: "informational",
      detail: "No critical threats detected, but always verify before inputting financial credentials.",
    });
  } else {
    recommendations.push({
      action: "Avoid Entering Passwords or 2FA",
      priority: "urgent",
      detail: "Do not provide usernames, credentials, or 2-factor codes on this landing page.",
    });
    recommendations.push({
      action: "Add to Firewall / DNS Blocklist",
      priority: "high",
      detail: `Block outbound traffic to '${hostname}' across perimeter network.`,
    });
  }

  const analysis: AnalysisResponse = {
    id: `rep-${Date.now()}`,
    submission_type: "url",
    target_summary: url,
    risk_score: riskScore,
    risk_category: riskCategory,
    confidence_score: Math.min(85 + (riskScore % 12), 99),
    status: "completed",
    findings,
    evidence,
    limitations: ["Dynamic payload evaluated inside CyberShield sandbox."],
    recommendations,
    model_info: {
      engine: "CyberShield Heuristic & Threat Intelligence Suite 2.4",
      analyzed_host: hostname,
      protocol: parsed.protocol,
    },
    created_at: new Date().toISOString(),
  };

  // Prepend to state analyses
  state.analyses.unshift(analysis);

  // If high or critical, generate alert
  if (riskScore >= 50) {
    state.alerts.unshift({
      id: `alt-${Date.now()}`,
      title: `High Threat Detected: ${hostname}`,
      message: `CyberShield inspector identified a ${riskCategory} risk threat on ${url}`,
      severity: riskCategory === "Critical" ? "critical" : "high",
      is_read: false,
      analysis_id: analysis.id,
      created_at: new Date().toISOString(),
    });
  }

  return analysis;
}

export function analyzeTextHeuristic(text: string, context_type: string = "message", user_label?: string): AnalysisResponse {
  let riskScore = 12;
  const findings: Finding[] = [];
  const evidence: EvidenceItem[] = [];
  const recommendations: Recommendation[] = [];

  const lower = text.toLowerCase();

  // Urgency triggers
  const urgencyWords = ["immediately", "urgent", "24 hours", "suspended", "action required", "legal action", "arrest warrant", "final notice", "penalty"];
  const matchedUrgency = urgencyWords.filter((w) => lower.includes(w));
  if (matchedUrgency.length > 0) {
    riskScore += 25 * Math.min(matchedUrgency.length, 3);
    findings.push({
      id: `f-${Date.now()}-urgency`,
      title: "Coercive Urgency & Threat Indicators",
      description: `Text contains panic-inducing terms (${matchedUrgency.join(", ")}), designed to bypass rational skepticism.`,
      severity: "high",
      category: "Social Engineering",
      confidence: 0.93,
    });
    evidence.push({
      signal_name: "Psychological Trigger",
      observation: `High pressure phrases detected: "${matchedUrgency.slice(0, 2).join('", "')}"`,
      impact: "negative",
    });
  }

  // Financial lures
  const financialWords = ["wire transfer", "gift card", "bitcoin", "crypto", "unclaimed funds", "lottery", "direct deposit", "routing number", "invoice payment"];
  const matchedFinancial = financialWords.filter((w) => lower.includes(w));
  if (matchedFinancial.length > 0) {
    riskScore += 30;
    findings.push({
      id: `f-${Date.now()}-financial`,
      title: "Unverified Financial Disbursement Request",
      description: `Request involves irregular payment rails (${matchedFinancial.join(", ")}), hallmarks of wire fraud and BEC schemes.`,
      severity: "critical",
      category: "Financial Scam",
      confidence: 0.94,
    });
  }

  // Credential requests
  const credWords = ["password", "otp", "passcode", "verify your code", "social security", "ssn", "secret question", "pin code"];
  const matchedCreds = credWords.filter((w) => lower.includes(w));
  if (matchedCreds.length > 0) {
    riskScore += 35;
    findings.push({
      id: `f-${Date.now()}-creds`,
      title: "Direct Credential Harvesting Attempt",
      description: `Message explicitly solicits sensitive authentication credentials or security codes.`,
      severity: "critical",
      category: "Credential Theft",
      confidence: 0.96,
    });
  }

  riskScore = Math.min(Math.max(riskScore, 8), 96);
  let riskCategory: "Low" | "Moderate" | "High" | "Critical" = "Low";
  if (riskScore >= 75) riskCategory = "Critical";
  else if (riskScore >= 50) riskCategory = "High";
  else if (riskScore >= 25) riskCategory = "Moderate";

  if (findings.length === 0) {
    findings.push({
      id: `f-${Date.now()}-safe`,
      title: "Neutral Tone & Standard Content",
      description: "Natural language processing did not identify severe social engineering triggers.",
      severity: "low",
      category: "Content Inspection",
      confidence: 0.91,
    });
    recommendations.push({
      action: "Standard Precaution",
      priority: "informational",
      detail: "No urgent scam patterns identified in text sample.",
    });
  } else {
    recommendations.push({
      action: "Do Not Send Funds or Data",
      priority: "urgent",
      detail: "Immediately cease communication. Do not fulfill requested payments or share verification codes.",
    });
    recommendations.push({
      action: "Confirm with Alleged Sender Out-of-Band",
      priority: "high",
      detail: "Contact the purported sender via an official telephone number or in-person channel.",
    });
  }

  const analysis: AnalysisResponse = {
    id: `rep-${Date.now()}`,
    submission_type: "text",
    target_summary: text.length > 80 ? `${text.slice(0, 77)}...` : text,
    risk_score: riskScore,
    risk_category: riskCategory,
    confidence_score: 92,
    status: "completed",
    findings,
    evidence,
    limitations: ["Text processed without external mailbox context headers."],
    recommendations,
    model_info: {
      engine: "CyberShield Pretexting NLP Classifier",
      context_type,
      word_count: text.split(/\s+/).length,
    },
    created_at: new Date().toISOString(),
  };

  state.analyses.unshift(analysis);
  return analysis;
}

export function analyzeFileHeuristic(filename: string, fileType: "image" | "audio" | "video", fileSize: number): AnalysisResponse {
  const isSuspiciousExt = /\.(exe|scr|bat|vbs|iso|dmg|apk)$/i.test(filename);
  let riskScore = isSuspiciousExt ? 95 : 22;

  const findings: Finding[] = [];
  const evidence: EvidenceItem[] = [];
  const recommendations: Recommendation[] = [];

  if (fileType === "image") {
    riskScore += 25;
    findings.push({
      id: `f-${Date.now()}-exif`,
      title: "Metadata & Steganography Inspection",
      description: "EXIF headers reviewed. Visual frequency check indicates minor compression variances.",
      severity: "medium",
      category: "Image Forensics",
      confidence: 0.84,
    });
    evidence.push({
      signal_name: "Color Space Variance",
      observation: "Specular illumination shows standard optical lens convergence",
      impact: "positive",
    });
  } else if (fileType === "audio") {
    riskScore += 30;
    findings.push({
      id: `f-${Date.now()}-audio`,
      title: "Synthetic Vocoder Phase Analysis",
      description: "Spectral analysis verified voice modulation frequencies against neural TTS baselines.",
      severity: "medium",
      category: "Audio Forensics",
      confidence: 0.81,
    });
  } else {
    riskScore += 28;
    findings.push({
      id: `f-${Date.now()}-video`,
      title: "Facial Boundary & Temporal Consistency",
      description: "Inspected inter-frame facial anchor consistency and eye-blink periodicity.",
      severity: "medium",
      category: "Video Forensics",
      confidence: 0.86,
    });
  }

  riskScore = Math.min(riskScore, 95);
  let riskCategory: "Low" | "Moderate" | "High" | "Critical" = "Low";
  if (riskScore >= 75) riskCategory = "Critical";
  else if (riskScore >= 50) riskCategory = "High";
  else if (riskScore >= 25) riskCategory = "Moderate";

  recommendations.push({
    action: "Preserve Original Media File",
    priority: "recommended",
    detail: "Keep untouched copy with hash checksum for evidentiary chain-of-custody if needed.",
  });

  const analysis: AnalysisResponse = {
    id: `rep-${Date.now()}`,
    submission_type: fileType,
    target_summary: `${filename} (${Math.round(fileSize / 1024)} KB)`,
    risk_score: riskScore,
    risk_category: riskCategory,
    confidence_score: 88,
    status: "completed",
    findings,
    evidence,
    limitations: ["Forensic file scan executed using simulated machine learning weights."],
    recommendations,
    model_info: {
      engine: "CyberShield Multimodal Neural Forensics Suite",
      file_size_bytes: fileSize,
      filename,
    },
    created_at: new Date().toISOString(),
  };

  state.analyses.unshift(analysis);
  return analysis;
}

export function generateAssistantReply(message: string, attachedReportId?: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("suspicious link") || lower.includes("clicked a link") || lower.includes("url")) {
    return `### 🚨 Immediate Steps If You Clicked a Suspicious Link:

1. **Disconnect or Airplane Mode:** Disconnect your device from Wi-Fi or mobile data immediately to stop background malware downloads or payload delivery.
2. **Do Not Enter Any Information:** If a webpage opened prompting you for your username, password, credit card, or 2FA code, **close the browser tab immediately**.
3. **Change Your Credentials:** From a separate, secure device, update the password of any account that might be associated with the link.
4. **Enable Hardware or App-Based 2FA:** Switch from SMS authentication to authenticator apps (like Google Authenticator or YubiKey).
5. **Scan for Malware:** Run an endpoint malware scan with Windows Defender or your enterprise antivirus.

Would you like me to inspect the exact URL for you? You can paste it into the **Threat Inspector** tab anytime!`;
  }

  if (lower.includes("voice clone") || lower.includes("deepfake audio") || lower.includes("audio")) {
    return `### 🎙️ How to Identify AI Voice Clones & Vishing Scams:

1. **Acoustic & Robotic Prosody:** Synthetic voice generators often lack natural breathing pauses, subtle throat clearing, or room resonance.
2. **Manufactured Extreme Crisis:** Attackers fabricate bail emergencies, kidnapping claims, or urgent executive wire mandates to trigger panic.
3. **Establish a Safe Word:** Create a secret, unguessable verbal code word with your family or executive finance team.
4. **Independent Callback Protocol:** Immediately hang up and call the alleged person back using their known, pre-saved phone number.

Never authorize financial disbursements based solely on phone requests or audio messages!`;
  }

  if (lower.includes("risk score") || lower.includes("what does my score mean")) {
    return `### 🛡️ Understanding CyberShield Risk Scores:

CyberShield assesses submitted threats on a **0 to 100** scale combining heuristic patterns, domain intelligence, and machine learning signals:

- **0 – 24 (Low Risk / Green):** Verified authentic infrastructure, valid cryptographic certificates, and absence of known threat indicators.
- **25 – 49 (Moderate Risk / Yellow):** Minor inconsistencies observed (e.g. newly registered domain, generic templates), but no direct malicious payloads.
- **50 – 74 (High Risk / Orange):** Significant threat markers present (e.g. coercive urgency, suspicious TLD, typosquatting brand keywords).
- **75 – 100 (Critical Risk / Red):** Confirmed weaponized phishing kit, bare IP host, or active credential interception mechanism. Avoid immediately!`;
  }

  if (lower.includes("subdomain") || lower.includes("trick") || lower.includes("homograph")) {
    return `### 🌐 How Attackers Abuse Subdomains & Homographs:

Phishers exploit how humans read URLs from left to right.

- **Subdomain Abuse:** In \`https://paypal.com.account-update.xyz/\`, the true domain is **\`account-update.xyz\`**. \`paypal.com\` is just an arbitrary prefix added by the attacker!
- **Homograph / Punycode:** Attackers replace Latin letters with visually identical Cyrillic or Greek characters (e.g. \`gооgle.com\` using Cyrillic \`о\`, encoded as \`xn--ggle-p50aa.com\`).

**Golden Rule:** Always read URLs backward from the first single forward slash \`/\` to find the actual host!`;
  }

  return `### 🛡️ CyberShield AI Defense Guidance

Thank you for your inquiry. Regarding your security question:

1. **Verify Source Authenticity:** Always check full email headers and root domain names rather than relying solely on display names.
2. **Apply Zero-Trust Principles:** Treat unexpected links, payment instructions, or verification demands with caution.
3. **Utilize CyberShield Analysis:** You can submit any URL, text excerpt, or media file to our **Threat Inspector** for real-time forensic scanning.

Is there a specific incident or suspicious communication you would like to analyze together?`;
}
