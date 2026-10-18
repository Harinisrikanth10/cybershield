import re
from typing import Dict, Any, List
from app.services.risk_scorer import risk_engine
from app.utils.sanitization import create_safe_preview

# Indicators patterns
URGENCY_PATTERNS = [
    (r"\b(immediately|urgent|within\s+\d+\s*(hours?|mins?|minutes?)|account\s+(will\s+be\s+)?(suspended|terminated|blocked|closed)|action\s+required\s+now)\b", "Severe Artificial Urgency", 22),
    (r"\b(last\s+chance|final\s+notice|expire(s)?\s+today|time\s+sensitive)\b", "Time-Pressure Lure", 15),
]

CREDENTIAL_HARVEST_PATTERNS = [
    (r"\b(enter\s+your\s+(password|passcode|pin)|verify\s+your\s+identity|confirm\s+your\s+account|update\s+billing\s+details|provide\s+your\s+(otp|one-time\s+password|security\s+code))\b", "Direct Credential / OTP Solicitation", 36),
    (r"\b(click\s+here\s+to\s+verify|log\s+in\s+to\s+restore|unlock\s+account)\b", "Account Access Lure", 20),
]

FINANCIAL_FRAUD_PATTERNS = [
    (r"\b(wire\s+transfer|bitcoin|btc|usdt|crypto(currency)?|gift\s+cards?|western\s+union|moneygram|cash\s+app|zelle|venmo)\b", "Irreversible Payment Mechanism", 28),
    (r"\b(won\s+a?\s*lottery|inheritance|unclaimed\s+(funds|inheritance|prize)|grant\s+approved|compensation\s+fund)\b", "Advance-Fee / Lottery Scam Pattern", 34),
    (r"\b(invoice\s+(overdue|attached|unpaid)|remittance\s+advice|payroll\s+update)\b", "Fake Invoice / Payroll Lure", 20),
]

COERCION_PATTERNS = [
    (r"\b(police|fbi|irs|court\s+summons|arrest\s+warrant|legal\s+consequences|warrant\s+issued|confidential\s+matter|do\s+not\s+(tell|discuss|call))\b", "Authority Coercion / Secrecy Mandate", 32),
]

EXTRACT_URL_REGEX = re.compile(r"https?://[^\s<>\"']+|www\.[^\s<>\"']+", re.IGNORECASE)

def analyze_text(text: str, context_type: str = "message") -> Dict[str, Any]:
    """
    Analyzes message or email text for phishing, social engineering,
    credential harvesting, and financial fraud indicators.
    """
    cleaned_text = text.strip()
    preview = create_safe_preview(cleaned_text, max_length=140)
    
    signals: List[Dict[str, Any]] = []
    observed_facts: List[Dict[str, Any]] = []
    evaluated_checks = 0
    total_checks = 7

    # 1. Check embedded URLs
    evaluated_checks += 1
    found_urls = EXTRACT_URL_REGEX.findall(cleaned_text)
    observed_facts.append({
        "name": "Embedded Links",
        "detail": f"Identified {len(found_urls)} hyperlink(s) in body text." if found_urls else "No hyperlinks detected in message text.",
        "value": str(len(found_urls)),
        "impact": "negative" if len(found_urls) > 0 else "neutral",
    })
    if found_urls:
        signals.append({
            "id": "embedded_links",
            "category": "link_solicitation",
            "weight": 18,
            "title": "Embedded Hyperlink in Message",
            "description": f"Contains {len(found_urls)} external link(s). Unsolicited links in urgent messages are a primary vector for credential harvesting.",
            "severity": "medium",
            "confidence": 0.90,
        })

    # 2. Credential & OTP harvesting
    evaluated_checks += 1
    cred_matches = []
    for pattern, label, weight in CREDENTIAL_HARVEST_PATTERNS:
        match = re.search(pattern, cleaned_text, re.IGNORECASE)
        if match:
            cred_matches.append((label, weight, match.group(0)))

    if cred_matches:
        highest_weight = max(m[1] for m in cred_matches)
        labels = ", ".join(m[0] for m in cred_matches)
        observed_facts.append({
            "name": "Credential Requests",
            "detail": f"Matched pattern(s): {labels}.",
            "value": "Detected",
            "impact": "negative",
        })
        signals.append({
            "id": "credential_solicitation",
            "category": "credential_harvesting",
            "weight": highest_weight,
            "title": "Credential or One-Time Passcode Request",
            "description": "Message prompts user to enter passwords, PINs, or verification codes. Legitimate providers never ask for OTPs or passwords via message.",
            "severity": "critical" if highest_weight >= 35 else "high",
            "confidence": 0.95,
        })
    else:
        observed_facts.append({
            "name": "Credential Requests",
            "detail": "No explicit requests for passwords or OTPs detected.",
            "value": "Clean",
            "impact": "positive",
        })

    # 3. Urgency & Time Pressure
    evaluated_checks += 1
    urgency_matches = []
    for pattern, label, weight in URGENCY_PATTERNS:
        match = re.search(pattern, cleaned_text, re.IGNORECASE)
        if match:
            urgency_matches.append((label, weight, match.group(0)))

    if urgency_matches:
        observed_facts.append({
            "name": "Psychological Urgency Trigger",
            "detail": f"Detected urgency phrases ({', '.join(m[0] for m in urgency_matches)}).",
            "value": "Detected",
            "impact": "negative",
        })
        signals.append({
            "id": "artificial_urgency",
            "category": "urgency_manipulation",
            "weight": max(m[1] for m in urgency_matches),
            "title": "Manufactured Time Urgency",
            "description": "Message leverages imminent negative consequences (e.g., account termination) to short-circuit critical thinking.",
            "severity": "medium",
            "confidence": 0.86,
        })
    else:
        observed_facts.append({
            "name": "Urgency Triggers",
            "detail": "Standard neutral phrasing observed.",
            "value": "Clean",
            "impact": "positive",
        })

    # 4. Financial Fraud & Irreversible Payments
    evaluated_checks += 1
    fin_matches = []
    for pattern, label, weight in FINANCIAL_FRAUD_PATTERNS:
        match = re.search(pattern, cleaned_text, re.IGNORECASE)
        if match:
            fin_matches.append((label, weight, match.group(0)))

    if fin_matches:
        observed_facts.append({
            "name": "Financial Solicitations",
            "detail": f"Identified payment indicators ({', '.join(m[0] for m in fin_matches)}).",
            "value": "Detected",
            "impact": "negative",
        })
        signals.append({
            "id": "financial_solicitation",
            "category": "financial_fraud",
            "weight": max(m[1] for m in fin_matches),
            "title": "Irreversible Payment or Advance-Fee Pattern",
            "description": "Message directs funds toward wire transfers, gift cards, or crypto assets, which are inherently unrecoverable if fraudulent.",
            "severity": "high",
            "confidence": 0.90,
        })
    else:
        observed_facts.append({
            "name": "Financial Solicitations",
            "detail": "No requests for unusual funds or gift cards detected.",
            "value": "Clean",
            "impact": "positive",
        })

    # 5. Coercion & Secrecy Mandates
    evaluated_checks += 1
    coercion_matches = []
    for pattern, label, weight in COERCION_PATTERNS:
        match = re.search(pattern, cleaned_text, re.IGNORECASE)
        if match:
            coercion_matches.append((label, weight, match.group(0)))

    if coercion_matches:
        observed_facts.append({
            "name": "Coercion & Authority Invocations",
            "detail": f"Detected authority or intimidation keywords ({', '.join(m[0] for m in coercion_matches)}).",
            "value": "Detected",
            "impact": "negative",
        })
        signals.append({
            "id": "coercion_intimidation",
            "category": "authority_impersonation",
            "weight": max(m[1] for m in coercion_matches),
            "title": "Authority Impersonation & Secrecy Pressure",
            "description": "Mentions law enforcement or legal action and commands the recipient not to verify or disclose the message.",
            "severity": "high",
            "confidence": 0.92,
        })
    else:
        observed_facts.append({
            "name": "Coercion Indicators",
            "detail": "No coercive or legal intimidation language detected.",
            "value": "Clean",
            "impact": "positive",
        })

    # 6. Generic Greeting / Salutation Check
    evaluated_checks += 1
    has_generic_greeting = bool(re.search(r"^(dear\s+(customer|user|client|sir|madam|valued\s+member)|attention:)", cleaned_text, re.IGNORECASE | re.MULTILINE))
    observed_facts.append({
        "name": "Salutation Specificity",
        "detail": "Message begins with generic recipient salutation rather than user's personalized name." if has_generic_greeting else "Personalized or direct salutation.",
        "value": "Generic" if has_generic_greeting else "Specific/Direct",
        "impact": "negative" if has_generic_greeting else "neutral",
    })
    if has_generic_greeting:
        signals.append({
            "id": "impersonal_salutation",
            "category": "broadcast_phishing",
            "weight": 12,
            "title": "Generic Impersonal Salutation",
            "description": "Mass-phishing campaigns frequently use impersonal greetings (e.g. 'Dear Customer') because attackers lack recipient identity records.",
            "severity": "low",
            "confidence": 0.72,
        })

    # 7. Grammar / Capitalization / Noise Analysis
    evaluated_checks += 1
    caps_count = sum(1 for c in cleaned_text if c.isupper())
    caps_ratio = (caps_count / len(cleaned_text)) if len(cleaned_text) > 0 else 0.0
    is_excessive_caps = caps_ratio > 0.35 and len(cleaned_text) > 40
    observed_facts.append({
        "name": "Capitalization Ratio",
        "detail": f"Uppercase letter ratio: {round(caps_ratio * 100, 1)}%.",
        "value": f"{round(caps_ratio * 100, 1)}%",
        "impact": "negative" if is_excessive_caps else "neutral",
    })
    if is_excessive_caps:
        signals.append({
            "id": "excessive_capitalization",
            "category": "formatting_anomaly",
            "weight": 10,
            "title": "Aggressive Capitalization Formatting",
            "description": "Unusually high percentage of capital letters used to evoke alarm and urgency.",
            "severity": "low",
            "confidence": 0.70,
        })

    # Score calculation
    result = risk_engine.compute_risk(
        signals=signals,
        observed_facts=observed_facts,
        evaluated_checks=evaluated_checks,
        total_possible_checks=total_checks,
        is_limited=False,
    )

    result["target_summary"] = preview
    result["raw_input_preview"] = preview
    result["model_info"] = {
        "engine": "CyberShield Linguistic Phishing & Social Engineering Classifier",
        "context_type": context_type,
        "heuristics_version": "1.0",
    }

    return result
