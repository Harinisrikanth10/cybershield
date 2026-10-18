from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.db.session import engine, Base
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User
from app.models.analysis import AnalysisRecord
from app.models.alert import Alert
from app.models.learn import Course, Lesson, QuizQuestion, UserLearnProgress

def init_db(db: Session):
    # Create all tables
    Base.metadata.create_all(bind=engine)

    # 1. Seed Demo User
    demo_user = db.query(User).filter(User.email == settings.DEMO_USER_EMAIL).first()
    if not demo_user:
        demo_user = User(
            email=settings.DEMO_USER_EMAIL,
            hashed_password=get_password_hash(settings.DEMO_USER_PASSWORD),
            full_name=settings.DEMO_USER_NAME,
            is_admin=True,
            role="security_analyst",
            theme="dark",
            notify_email=True,
            notify_high_risk=True,
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

    # 2. Seed Learning Modules & Quizzes
    if db.query(Course).count() == 0:
        courses_data = [
            {
                "slug": "phishing-and-urls",
                "title": "Phishing & URL Deception",
                "category": "Web Safety",
                "description": "Master techniques to identify deceptive subdomains, homograph tricks, and credential harvesting kits.",
                "icon": "Globe",
                "estimated_minutes": 6,
                "lessons": [
                    {
                        "order_index": 1,
                        "title": "Deconstruct Malicious URLs",
                        "content": "Phishers abuse subdomains to make URLs look official. For example, `https://paypal.com.verify-billing.xyz/` actually leads to `verify-billing.xyz`, NOT PayPal. Always read the domain starting from the first single forward slash `/` backwards to find the true root domain.",
                        "key_takeaways": [
                            "The true domain is the last two labels before the first single slash.",
                            "HTTPS encryption does not mean a site is verified or safe.",
                            "Shortened URLs conceal target landing pages."
                        ],
                    },
                    {
                        "order_index": 2,
                        "title": "Credential Harvesting Kits",
                        "content": "Phishing kits replicate official login screens with pixel-perfect accuracy. Look for mismatched domains, lack of browser autofill recognition, and unprompted requests for secondary credentials like ATM PINs or mother's maiden name.",
                        "key_takeaways": [
                            "Password managers will refuse to autofill on spoofed domains.",
                            "Legitimate institutions will never ask for your PIN via web form."
                        ],
                    }
                ],
                "quizzes": [
                    {
                        "question": "Which domain is the actual host in 'https://microsoft.com.account-update.top/login'?",
                        "options": ["microsoft.com", "account-update.top", "login", "None of the above"],
                        "correct_option_index": 1,
                        "explanation": "In hierarchical domain structure, the host is determined by the last two segments before the path slash. 'microsoft.com' is merely a misleading subdomain.",
                    },
                    {
                        "question": "Does having a valid padlock icon (HTTPS) guarantee a website is legitimate?",
                        "options": ["Yes, it proves the business is vetted", "No, HTTPS only encrypts the connection in transit", "Yes, if it has a .com domain", "Only on mobile devices"],
                        "correct_option_index": 1,
                        "explanation": "HTTPS encrypts data between your browser and the server. Attackers easily obtain free SSL certificates for their fraudulent domains.",
                    }
                ]
            },
            {
                "slug": "deepfakes-and-synthetic-media",
                "title": "Deepfakes & Synthetic Media",
                "category": "Media Forensics",
                "description": "Learn visual artifact analysis, spatial-temporal inconsistencies, and generative AI boundaries.",
                "icon": "Eye",
                "estimated_minutes": 8,
                "lessons": [
                    {
                        "order_index": 1,
                        "title": "Visual Artifacts in Deepfake Videos",
                        "content": "Neural face-swapping often introduces subtle boundary glitches along the jawline, around the ears, and in eye reflections (specular highlights). Look for erratic blinking patterns and lighting mismatches between the face and background.",
                        "key_takeaways": [
                            "Observe lighting angles in eye reflections.",
                            "Check for edge blurring when objects pass in front of faces.",
                            "Notice unnatural teeth texture or jewelry distortion."
                        ],
                    }
                ],
                "quizzes": [
                    {
                        "question": "What is a common visual indicator of synthetic face generation?",
                        "options": ["Inconsistent specular highlights in the eyes", "4K resolution video", "Stereo audio", "Natural pupil dilation"],
                        "correct_option_index": 0,
                        "explanation": "Synthetic diffusion and GAN models often render mismatched reflections in the left and right eyes due to independent generative processing.",
                    }
                ]
            },
            {
                "slug": "voice-cloning-scams",
                "title": "Voice-Cloning & Audio Scams",
                "category": "Audio Safety",
                "description": "Protect yourself and your organization against AI CEO fraud and urgent family emergency voice impersonations.",
                "icon": "Mic",
                "estimated_minutes": 5,
                "lessons": [
                    {
                        "order_index": 1,
                        "title": "The Anatomy of a Vishing Call",
                        "content": "Attackers can clone a human voice using as little as 3 seconds of reference audio harvested from social media or webinars. They use this in high-stakes phone calls demanding emergency bail money or wire approvals.",
                        "key_takeaways": [
                            "Establish a secret verbal family password.",
                            "Hang up and call the person back on their verified number.",
                            "Listen for robotic prosody and lack of breath sounds."
                        ],
                    }
                ],
                "quizzes": [
                    {
                        "question": "If you receive an urgent phone call from an executive or relative demanding funds, what is the best first step?",
                        "options": ["Wire the funds immediately", "Hang up and call them back on their known number", "Ask them for their credit card", "Reply with an SMS"],
                        "correct_option_index": 1,
                        "explanation": "Always verify unexpected emergency financial requests through an independent, pre-established communications channel.",
                    }
                ]
            },
            {
                "slug": "social-engineering-tactics",
                "title": "Social Engineering & Pretexting",
                "category": "Defense Fundamentals",
                "description": "Understand psychological manipulation, authority bias, and artificial urgency triggers.",
                "icon": "AlertTriangle",
                "estimated_minutes": 7,
                "lessons": [
                    {
                        "order_index": 1,
                        "title": "The Urgency Manipulation Loop",
                        "content": "Scammers manufacture artificial crises ('Arrest warrant issued', 'Tax audit pending') to induce anxiety, which impairs rational decision making.",
                        "key_takeaways": [
                            "High urgency is the #1 red flag in unsolicited communications.",
                            "Government agencies do not notify you of arrest warrants via text message."
                        ],
                    }
                ],
                "quizzes": [
                    {
                        "question": "Why do cybercriminals deliberately create intense time pressure in their messages?",
                        "options": ["To comply with internet regulations", "To prevent targets from verifying claims through normal channels", "To save server bandwidth", "Because attacks must complete in 5 minutes"],
                        "correct_option_index": 1,
                        "explanation": "Urgency short-circuits critical thinking and makes targets act before checking with colleagues, banks, or family.",
                    }
                ]
            },
            {
                "slug": "password-and-mfa-hygiene",
                "title": "Password Security & MFA",
                "category": "Identity Protection",
                "description": "Build unbreakable credential habits with password managers and phishing-resistant Passkeys.",
                "icon": "KeyRound",
                "estimated_minutes": 6,
                "lessons": [
                    {
                        "order_index": 1,
                        "title": "Why Password Reuse is Catastrophic",
                        "content": "When one third-party service suffers a database breach, credential-stuffing bots test that password across thousands of other sites within hours.",
                        "key_takeaways": [
                            "Use a unique 16+ character password for every service.",
                            "Prefer hardware FIDO2 keys or Passkeys over SMS 2FA."
                        ],
                    }
                ],
                "quizzes": [
                    {
                        "question": "Which form of Multi-Factor Authentication (MFA) is most resistant to real-time phishing proxy attacks?",
                        "options": ["SMS text message codes", "FIDO2 / WebAuthn Passkeys", "Email verification links", "Security questions"],
                        "correct_option_index": 1,
                        "explanation": "FIDO2 Passkeys are cryptographically bound to the browser's verified domain origin, making it impossible for a phisher's proxy site to reuse the credential.",
                    }
                ]
            },
            {
                "slug": "account-takeover-defense",
                "title": "Account Takeover & Session Hijacking",
                "category": "Identity Protection",
                "description": "How infostealers steal browser cookies, session tokens, and bypass traditional authentication.",
                "icon": "ShieldAlert",
                "estimated_minutes": 5,
                "lessons": [
                    {
                        "order_index": 1,
                        "title": "Infostealer Malware & Cookie Theft",
                        "content": "Modern infostealers (e.g. RedLine, Lumma) steal active session cookies directly from your browser's SQLite database, allowing attackers to hijack accounts without needing your password or 2FA.",
                        "key_takeaways": [
                            "Never download cracked software, game cheats, or unverified executables.",
                            "Regularly log out of active sessions on shared devices."
                        ],
                    }
                ],
                "quizzes": [
                    {
                        "question": "How can an attacker access your account even if you have 2FA enabled?",
                        "options": ["By stealing your active browser session cookie via malware", "By guessing your motherboard serial number", "By pinging your IP address", "By reading your public DNS"],
                        "correct_option_index": 0,
                        "explanation": "Session cookies represent an already-authenticated state; if an attacker steals your cookie, they can impersonate your active session without triggering 2FA.",
                    }
                ]
            },
            {
                "slug": "qr-code-scams-quishing",
                "title": "QR-Code Fraud (Quishing)",
                "category": "Emerging Threats",
                "description": "Detect malicious QR codes on parking meters, restaurant menus, and targeted email attachments.",
                "icon": "QrCode",
                "estimated_minutes": 4,
                "lessons": [
                    {
                        "order_index": 1,
                        "title": "The Quishing Vector",
                        "content": "Because email security gateways cannot easily parse images or QR codes, attackers embed them into PDFs to direct targets to mobile phishing sites where security tools are weaker.",
                        "key_takeaways": [
                            "Inspect the preview URL on your phone before tapping to open a QR code.",
                            "Look out for physical sticker overlays on public parking meters."
                        ],
                    }
                ],
                "quizzes": [
                    {
                        "question": "What is the primary danger when scanning a physical QR code on a public kiosk or parking meter?",
                        "options": ["It exhausts your phone battery", "A fraudster may have pasted a malicious sticker over the legitimate code", "It reveals your MAC address", "It formats your SIM card"],
                        "correct_option_index": 1,
                        "explanation": "Physical QR tampering is very common: scammers paste stickers with their own phishing payment URLs directly over legitimate parking meter codes.",
                    }
                ]
            },
            {
                "slug": "safe-online-payments",
                "title": "Safe Online Payments & Wire Fraud",
                "category": "Financial Safety",
                "description": "Guard against Business Email Compromise (BEC), fake invoices, and unauthorized wire redirections.",
                "icon": "CreditCard",
                "estimated_minutes": 6,
                "lessons": [
                    {
                        "order_index": 1,
                        "title": "Invoice Modification Fraud",
                        "content": "Attackers compromise vendor email accounts and silently monitor email threads. When an invoice is due, they send an updated PDF claiming 'our bank account has changed due to an audit'.",
                        "key_takeaways": [
                            "Always call the vendor's accounts receivable team to verbally verify any updated banking details.",
                            "Never pay using gift cards or anonymous crypto for official services."
                        ],
                    }
                ],
                "quizzes": [
                    {
                        "question": "If an existing vendor emails you saying their bank account details changed for today's payment, what should you do?",
                        "options": ["Update your records and wire immediately", "Reply to the email asking if it's real", "Call the vendor's known finance department via an established phone number to verify", "Forward the invoice to personal email"],
                        "correct_option_index": 2,
                        "explanation": "If the vendor's email was hacked, replying to the email will only reach the scammer. Verbal confirmation via a verified number is the only safe check.",
                    }
                ]
            }
        ]

        for c_data in courses_data:
            course = Course(
                slug=c_data["slug"],
                title=c_data["title"],
                category=c_data["category"],
                description=c_data["description"],
                icon=c_data["icon"],
                estimated_minutes=c_data["estimated_minutes"],
            )
            db.add(course)
            db.commit()
            db.refresh(course)

            for l_data in c_data["lessons"]:
                lesson = Lesson(
                    course_id=course.id,
                    order_index=l_data["order_index"],
                    title=l_data["title"],
                    content=l_data["content"],
                    key_takeaways=l_data["key_takeaways"],
                )
                db.add(lesson)

            for q_data in c_data["quizzes"]:
                quiz = QuizQuestion(
                    course_id=course.id,
                    question=q_data["question"],
                    options=q_data["options"],
                    correct_option_index=q_data["correct_option_index"],
                    explanation=q_data["explanation"],
                )
                db.add(quiz)
            
            db.commit()

    # 3. Seed Realistic Threat Analyses for Demo Account if none exist
    if db.query(AnalysisRecord).filter(AnalysisRecord.user_id == demo_user.id).count() == 0:
        now = datetime.now(timezone.utc)
        demo_analyses = [
            {
                "type": "url",
                "target": "login.paypal.account-verify-security.top/webapps/mpp/home",
                "preview": "https://login.paypal.account-verify-security.top/webapps/mpp/home?token=89412",
                "score": 92,
                "category": "Critical",
                "confidence": 0.95,
                "status": "completed",
                "findings": [
                    {"id": "brand_in_subdomain", "title": "Deceptive Brand Subdomain Impersonation", "description": "Prepends 'paypal' as a subdomain while the actual root domain is unverified 'account-verify-security.top'.", "severity": "critical", "category": "brand_impersonation", "confidence": 0.98},
                    {"id": "suspicious_tld", "title": "High-Risk Top-Level Domain (.top)", "description": "TLD exhibits 84% correlation with malicious phishing kits.", "severity": "medium", "category": "domain_reputation", "confidence": 0.85},
                    {"id": "phishing_path_tokens", "title": "Authentication-Themed Path Structure", "description": "URL path contains sensitive login and account verification parameters.", "severity": "high", "category": "credential_harvesting", "confidence": 0.90}
                ],
                "evidence": [
                    {"signal_name": "Protocol", "observation": "HTTPS transport active (Let's Encrypt automated certificate).", "raw_value": "https", "impact": "neutral"},
                    {"signal_name": "Domain Breakdown", "observation": "Registered domain: 'account-verify-security.top'. Subdomain: 'login.paypal'.", "raw_value": "login.paypal.account-verify-security.top", "impact": "negative"},
                    {"signal_name": "Target Destination", "observation": "SSRF check passed. External IP resolved.", "raw_value": "185.220.101.5", "impact": "neutral"}
                ],
                "limitations": ["Evaluated 11 recognized indicator dimensions.", "Risk score reflects lexical and structural threat indicators."],
                "recommendations": [
                    {"action": "Do Not Interact or Provide Information", "priority": "urgent", "detail": "Never submit credentials or financial data to this host."},
                    {"action": "Report Host to Registrar", "priority": "high", "detail": "Submit abuse complaint to registrar for domain takedown."}
                ],
                "model_info": {"engine": "CyberShield Intelligent URL Heuristics", "version": "1.0", "ssrf_protected": True},
                "delta_hours": 2,
            },
            {
                "type": "text",
                "target": "URGENT: Your Bank Account Access Has Been Restricted [Case #9482]",
                "preview": "URGENT NOTICE: Suspicious transaction of $2,450.00 detected on your Chase debit card. Your account has been temporarily restricted. Reply immediately with your online banking password and SMS verification code to restore access within 2 hours or your account will be permanently closed.",
                "score": 88,
                "category": "Critical",
                "confidence": 0.96,
                "status": "completed",
                "findings": [
                    {"id": "credential_solicitation", "title": "Direct Password & OTP Solicitation", "description": "Explicit demand for online banking password and one-time verification passcode.", "severity": "critical", "category": "credential_harvesting", "confidence": 0.99},
                    {"id": "artificial_urgency", "title": "Manufactured Time Pressure", "description": "Threatens permanent account closure within 2 hours to provoke emotional panic.", "severity": "high", "category": "urgency_manipulation", "confidence": 0.92}
                ],
                "evidence": [
                    {"signal_name": "Credential Requests", "observation": "Matched pattern for password and OTP solicitation.", "raw_value": "Detected", "impact": "negative"},
                    {"signal_name": "Urgency Triggers", "observation": "Explicit deadline and account suspension consequence detected.", "raw_value": "within 2 hours", "impact": "negative"}
                ],
                "limitations": ["Evaluated linguistic phishing and social engineering markers.", "Does not track sender telecom header records."],
                "recommendations": [
                    {"action": "Do Not Reply with Passcodes", "priority": "urgent", "detail": "Banks never request OTPs via message."},
                    {"action": "Contact Bank Directly", "priority": "high", "detail": "Use the official phone number printed on the back of your card."}
                ],
                "model_info": {"engine": "CyberShield Linguistic Phishing Classifier", "heuristics_version": "1.0"},
                "delta_hours": 8,
            },
            {
                "type": "image",
                "target": "executive_id_badge_scan.png (1024x1024)",
                "preview": "Uploaded executive identification card mockup with synthetic portrait.",
                "score": 42,
                "category": "Moderate",
                "confidence": 0.65,
                "status": "completed",
                "findings": [
                    {"id": "missing_exif", "title": "Absence of Camera Sensor EXIF", "description": "File metadata does not contain hardware camera or device provenance records.", "severity": "low", "category": "metadata_provenance", "confidence": 0.65},
                    {"id": "standard_diffusion_resolution", "title": "Diffusion Canvas Dimensions (1024x1024)", "description": "Exact square dimensions standard for Midjourney and Stable Diffusion generative models.", "severity": "medium", "category": "ai_generation_indicator", "confidence": 0.70}
                ],
                "evidence": [
                    {"signal_name": "Image Dimensions", "observation": "1024 x 1024 px (Aspect ratio: 1.0).", "raw_value": "1024x1024", "impact": "neutral"},
                    {"signal_name": "EXIF Metadata", "observation": "0 tags found. Hardware headers stripped.", "raw_value": "0", "impact": "negative"}
                ],
                "limitations": ["Evaluated 6 forensic heuristics. Heavy transformer deepfake model is in fallback mode."],
                "recommendations": [
                    {"action": "Exercise Heightened Caution", "priority": "high", "detail": "Verify identity documentation through physical inspection or secure PKI."}
                ],
                "model_info": {"engine": "CyberShield Digital Image Forensics", "heavy_neural_model_active": False},
                "delta_hours": 24,
            },
            {
                "type": "audio",
                "target": "ceo_urgent_wire_authorization.wav (~14.2s)",
                "preview": "Voicemail recording claiming to be CEO requesting emergency vendor payment.",
                "score": 68,
                "category": "High",
                "confidence": 0.72,
                "status": "completed",
                "findings": [
                    {"id": "tts_sample_rate", "title": "Sample Rate Typical of Neural Synthesizers (22050 Hz)", "description": "Acoustic frequency matches output profile of neural vocoders.", "severity": "medium", "category": "acoustic_fingerprint", "confidence": 0.72},
                    {"id": "executive_voice_lure", "title": "CEO Impersonation Context Lure", "description": "Message context requests urgent wire transfer, consistent with deepfake Vishing fraud.", "severity": "high", "category": "social_engineering", "confidence": 0.85}
                ],
                "evidence": [
                    {"signal_name": "Audio Properties", "observation": "WAV PCM audio, Duration ~14.2s, 1 channel.", "raw_value": "14.2s", "impact": "neutral"},
                    {"signal_name": "Sampling Rate Profile", "observation": "Sample rate: 22050 Hz.", "raw_value": "22050 Hz", "impact": "negative"}
                ],
                "limitations": ["Acoustic heuristics evaluated. Pretrained biometric model unconfigured.", "Does not provide legally binding voice identification."],
                "recommendations": [
                    {"action": "Verify Through Pre-Shared Passphrase", "priority": "urgent", "detail": "Require verbal confirmation of internal authorization code."}
                ],
                "model_info": {"engine": "CyberShield Acoustic & Voice-Cloning Indicator Engine", "heavy_neural_model_active": False},
                "delta_hours": 36,
            },
            {
                "type": "url",
                "target": "docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdB",
                "preview": "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdB",
                "score": 12,
                "category": "Low",
                "confidence": 0.92,
                "status": "completed",
                "findings": [],
                "evidence": [
                    {"signal_name": "Protocol", "observation": "Valid TLS HTTPS protocol.", "raw_value": "https", "impact": "positive"},
                    {"signal_name": "Domain Breakdown", "observation": "Official root domain 'google.com' with legitimate 'docs' subdomain.", "raw_value": "docs.google.com", "impact": "positive"}
                ],
                "limitations": ["Standard lexical checks passed. Does not analyze user-authored document content without permission."],
                "recommendations": [
                    {"action": "Routine Vigilance Advised", "priority": "informational", "detail": "Domain is authentic. Review document content normally."}
                ],
                "model_info": {"engine": "CyberShield Intelligent URL Heuristics", "version": "1.0", "ssrf_protected": True},
                "delta_hours": 48,
            }
        ]

        for item in demo_analyses:
            rec = AnalysisRecord(
                user_id=demo_user.id,
                submission_type=item["type"],
                target_summary=item["target"],
                raw_input_preview=item["preview"],
                risk_score=item["score"],
                risk_category=item["category"],
                confidence_score=item["confidence"],
                status=item["status"],
                findings_json=item["findings"],
                evidence_json=item["evidence"],
                limitations_json=item["limitations"],
                recommendations_json=item["recommendations"],
                model_info_json=item["model_info"],
                created_at=now - timedelta(hours=item["delta_hours"]),
            )
            db.add(rec)
            db.commit()
            db.refresh(rec)

            if rec.risk_score >= 50:
                alert = Alert(
                    user_id=demo_user.id,
                    analysis_id=rec.id,
                    title=f"{rec.risk_category} Risk Threat: {rec.target_summary[:35]}",
                    message=f"CyberShield flagged {len(rec.findings_json)} indicators with high threat probability.",
                    severity=rec.risk_category.lower(),
                    is_read=False if item["delta_hours"] <= 12 else True,
                    created_at=rec.created_at,
                )
                db.add(alert)
                db.commit()

        # Seed progress for the first course
        first_course = db.query(Course).first()
        if first_course:
            prog = UserLearnProgress(
                user_id=demo_user.id,
                course_id=first_course.id,
                completed=True,
                quiz_score=100.0,
                completed_at=now - timedelta(hours=5),
            )
            db.add(prog)
            db.commit()
