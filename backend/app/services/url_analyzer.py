import math
import re
from urllib.parse import urlparse, unquote
from typing import Dict, Any, List
from app.utils.ssrf import validate_url_safety
from app.services.risk_scorer import risk_engine
from app.core.config import settings

KNOWN_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "is.gd", "buff.ly", "ow.ly",
    "goo.gl", "cutt.ly", "shorte.st", "rb.gy", "rebrand.ly", "tiny.cc",
}

SUSPICIOUS_TLDS = {
    "zip", "mov", "top", "xyz", "buzz", "click", "loan", "work", "icu",
    "gq", "cf", "tk", "ml", "ga", "fit", "surf", "rest", "cam", "kim",
}

TARGETED_BRANDS = [
    "paypal", "apple", "microsoft", "google", "netflix", "chase", "wellsfargo",
    "bankofamerica", "amazon", "facebook", "instagram", "dhl", "fedex", "usps",
    "coinbase", "binance", "metamask", "steam", "telegram", "whatsapp",
]

def calculate_entropy(text: str) -> float:
    """Shannon entropy of a string."""
    if not text:
        return 0.0
    entropy = 0.0
    text_len = len(text)
    char_counts = {}
    for c in text:
        char_counts[c] = char_counts.get(c, 0) + 1
    for count in char_counts.values():
        p = count / text_len
        entropy -= p * math.log2(p)
    return round(entropy, 2)

def analyze_url(url_string: str) -> Dict[str, Any]:
    """
    Inspects URL structure, domain indicators, deception patterns, and safety.
    """
    url_cleaned = url_string.strip()
    if not url_cleaned.startswith(("http://", "https://")):
        url_cleaned = "https://" + url_cleaned

    # 1. SSRF Safety check
    is_safe, ssrf_msg, resolved_ip = validate_url_safety(url_cleaned)
    if not is_safe:
        # High-risk internal attack / metadata attempt
        return {
            "target_summary": url_string[:100],
            "risk_score": 95,
            "risk_category": "Critical",
            "confidence_score": 0.95,
            "status": "completed",
            "findings": [
                {
                    "id": "ssrf_violation",
                    "title": "Severe SSRF / Internal Network Target Detected",
                    "description": ssrf_msg,
                    "severity": "critical",
                    "category": "infrastructure_security",
                    "confidence": 0.99,
                }
            ],
            "evidence": [
                {
                    "signal_name": "Target Destination",
                    "observation": "URL targets loopback, private RFC1918 network, or cloud metadata service.",
                    "raw_value": str(resolved_ip or url_string),
                    "impact": "negative",
                }
            ],
            "limitations": [
                "Inspection blocked outbound routing due to network safety boundaries.",
            ],
            "recommendations": [
                {
                    "action": "Block Request Immediately",
                    "priority": "urgent",
                    "detail": "This URL attempts to pivot into private local infrastructure.",
                }
            ],
            "model_info": {
                "engine": "CyberShield SSRF & Network Safety Filter",
                "version": "1.0",
            },
        }

    try:
        parsed = urlparse(url_cleaned)
    except Exception as e:
        return {
            "target_summary": url_string[:80],
            "risk_score": 60,
            "risk_category": "High",
            "confidence_score": 0.90,
            "status": "completed",
            "findings": [
                {
                    "id": "malformed_url",
                    "title": "Malformed URL Structure",
                    "description": f"URL cannot be parsed: {str(e)}",
                    "severity": "high",
                    "category": "syntax",
                    "confidence": 0.9,
                }
            ],
            "evidence": [],
            "limitations": [],
            "recommendations": [],
            "model_info": {"engine": "CyberShield URL Syntax Analyzer"},
        }

    hostname = (parsed.hostname or "").lower()
    path = parsed.path or ""
    query = parsed.query or ""
    scheme = parsed.scheme.lower()

    signals: List[Dict[str, Any]] = []
    observed_facts: List[Dict[str, Any]] = []
    evaluated_checks = 0
    total_checks = 11

    # Fact 1: Scheme
    evaluated_checks += 1
    observed_facts.append({
        "name": "Protocol",
        "detail": f"Protocol is {scheme.upper()}.",
        "value": scheme,
        "impact": "positive" if scheme == "https" else "negative",
    })
    if scheme == "http":
        signals.append({
            "id": "insecure_http",
            "category": "protocol_security",
            "weight": 18,
            "title": "Unencrypted HTTP Protocol",
            "description": "Communication travels in cleartext, exposing credentials and session tokens to interception.",
            "severity": "medium",
            "confidence": 0.95,
        })

    # Fact 2: IP address hostname
    evaluated_checks += 1
    is_ip_host = bool(re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", hostname))
    observed_facts.append({
        "name": "Host Format",
        "detail": "Hostname uses raw numeric IP address instead of domain name." if is_ip_host else "Hostname uses standard domain name.",
        "value": hostname,
        "impact": "negative" if is_ip_host else "neutral",
    })
    if is_ip_host:
        signals.append({
            "id": "numeric_ip_host",
            "category": "host_deception",
            "weight": 35,
            "title": "Numeric IP Address in Hostname",
            "description": "Attackers frequently host phishing infrastructure directly on numeric IPs to evade domain reputational blocklists.",
            "severity": "high",
            "confidence": 0.92,
        })

    # Fact 3: Known URL Shortener
    evaluated_checks += 1
    is_shortener = hostname in KNOWN_SHORTENERS
    observed_facts.append({
        "name": "URL Redirection Service",
        "detail": f"Domain is known URL shortener ({hostname})." if is_shortener else "Direct domain URL.",
        "value": str(is_shortener),
        "impact": "negative" if is_shortener else "neutral",
    })
    if is_shortener:
        signals.append({
            "id": "url_shortener",
            "category": "destination_masking",
            "weight": 22,
            "title": "Obfuscated URL Shortener",
            "description": "The true landing page destination is concealed behind a redirection service, commonly used in phishing emails and SMS lures.",
            "severity": "medium",
            "confidence": 0.88,
        })

    # Fact 4: Deceptive Subdomain Brand Impersonation
    evaluated_checks += 1
    domain_parts = hostname.split(".")
    registered_domain = ".".join(domain_parts[-2:]) if len(domain_parts) >= 2 else hostname
    subdomains = ".".join(domain_parts[:-2]) if len(domain_parts) > 2 else ""

    targeted_brand_in_subdomain = None
    for brand in TARGETED_BRANDS:
        if brand in subdomains and brand not in registered_domain:
            targeted_brand_in_subdomain = brand
            break

    observed_facts.append({
        "name": "Domain Breakdown",
        "detail": f"Registered domain: '{registered_domain}', Subdomains: '{subdomains or 'None'}'.",
        "value": hostname,
        "impact": "negative" if targeted_brand_in_subdomain else "neutral",
    })

    if targeted_brand_in_subdomain:
        signals.append({
            "id": "brand_in_subdomain",
            "category": "brand_impersonation",
            "weight": 42,
            "title": f"High-Confidence Brand Impersonation ({targeted_brand_in_subdomain.capitalize()})",
            "description": f"The URL prepends brand name '{targeted_brand_in_subdomain}' as a subdomain, but the actual root domain is '{registered_domain}'.",
            "severity": "critical",
            "confidence": 0.96,
        })

    # Fact 5: Suspicious TLD
    evaluated_checks += 1
    tld = domain_parts[-1] if domain_parts else ""
    is_suspicious_tld = tld in SUSPICIOUS_TLDS
    observed_facts.append({
        "name": "Top-Level Domain",
        "detail": f"TLD is '.{tld}'.",
        "value": tld,
        "impact": "negative" if is_suspicious_tld else "neutral",
    })
    if is_suspicious_tld:
        signals.append({
            "id": "suspicious_tld",
            "category": "domain_reputation",
            "weight": 25,
            "title": f"Elevated-Risk Top-Level Domain (.{tld})",
            "description": f"The top-level domain '.{tld}' exhibits high historical correlation with spam, disposable fraud campaigns, and phishing.",
            "severity": "medium",
            "confidence": 0.82,
        })

    # Fact 6: At-Symbol URL Redirection Trick (@)
    evaluated_checks += 1
    has_at_symbol = "@" in url_string
    observed_facts.append({
        "name": "Credential/Userinfo Trick (@)",
        "detail": "URL contains an '@' character which discards the leading text as userinfo." if has_at_symbol else "No '@' character in URL.",
        "value": str(has_at_symbol),
        "impact": "negative" if has_at_symbol else "neutral",
    })
    if has_at_symbol:
        signals.append({
            "id": "at_symbol_deception",
            "category": "host_deception",
            "weight": 38,
            "title": "URL Userinfo Masking Trick (@)",
            "description": "Standard browsers discard everything before '@' as authentication credentials, causing the user to visit an unintended server.",
            "severity": "high",
            "confidence": 0.95,
        })

    # Fact 7: Domain Shannon Entropy
    evaluated_checks += 1
    entropy = calculate_entropy(hostname.replace(".", ""))
    observed_facts.append({
        "name": "Domain Character Entropy",
        "detail": f"Calculated Shannon entropy: {entropy} bits.",
        "value": str(entropy),
        "impact": "negative" if entropy > 3.9 else "neutral",
    })
    if entropy > 3.9:
        signals.append({
            "id": "high_entropy_domain",
            "category": "algorithmically_generated",
            "weight": 20,
            "title": "Possible Algorithmically Generated Domain (DGA)",
            "description": f"Domain exhibits high randomness ({entropy} entropy bits), typical of automated malware command-and-control or fast-flux networks.",
            "severity": "medium",
            "confidence": 0.78,
        })

    # Fact 8: URL Length and Path Depth
    evaluated_checks += 1
    url_len = len(url_string)
    is_excessive_len = url_len > 120
    observed_facts.append({
        "name": "URL String Length",
        "detail": f"URL length is {url_len} characters.",
        "value": str(url_len),
        "impact": "negative" if is_excessive_len else "neutral",
    })
    if url_len > 150:
        signals.append({
            "id": "excessive_url_length",
            "category": "payload_obfuscation",
            "weight": 14,
            "title": "Abnormally Long URL Structure",
            "description": "Unusually long URLs often embed serialized payloads, base64 data, or redirect tokens to bypass security inspection.",
            "severity": "low",
            "confidence": 0.75,
        })

    # Fact 9: Suspicious Phishing Keywords in Path or Query
    evaluated_checks += 1
    phish_keywords = ["login", "signin", "verify", "account", "update", "banking", "secure", "wallet", "confirm", "security", "recovery"]
    found_keywords = [kw for kw in phish_keywords if kw in (path + query).lower()]
    observed_facts.append({
        "name": "Sensitive Authentication Keywords",
        "detail": f"Identified sensitive path tokens: {', '.join(found_keywords)}" if found_keywords else "No suspicious authentication keywords found in path.",
        "value": ", ".join(found_keywords),
        "impact": "negative" if len(found_keywords) >= 2 else "neutral",
    })
    if len(found_keywords) >= 2 and not targeted_brand_in_subdomain:
        signals.append({
            "id": "phishing_path_tokens",
            "category": "credential_harvesting",
            "weight": 20,
            "title": "Authentication-Themed URL Path",
            "description": f"URL path and parameters contain sensitive keywords ({', '.join(found_keywords)}) on an unverified third-party domain.",
            "severity": "medium",
            "confidence": 0.80,
        })

    # Fact 10: Suspicious Port
    evaluated_checks += 1
    port = parsed.port
    is_non_standard_port = port is not None and port not in (80, 443, 8080)
    observed_facts.append({
        "name": "Port Number",
        "detail": f"Port is {port or (443 if scheme == 'https' else 80)}.",
        "value": str(port or "default"),
        "impact": "negative" if is_non_standard_port else "neutral",
    })
    if is_non_standard_port:
        signals.append({
            "id": "non_standard_port",
            "category": "infrastructure_security",
            "weight": 18,
            "title": f"Non-Standard Port ({port})",
            "description": "Legitimate consumer services rarely host login interfaces on non-standard ports.",
            "severity": "medium",
            "confidence": 0.85,
        })

    # Fact 11: External Threat Intelligence Reputation Check
    evaluated_checks += 1
    has_ext_key = bool(settings.GOOGLE_SAFE_BROWSING_KEY)
    observed_facts.append({
        "name": "External Threat Intelligence Feeds",
        "detail": "Operating in local heuristic mode (Google Safe Browsing key not configured)." if not has_ext_key else "External reputation API configured.",
        "value": "Heuristic Mode",
        "impact": "neutral",
    })

    # Run the Risk Scoring Engine
    result = risk_engine.compute_risk(
        signals=signals,
        observed_facts=observed_facts,
        evaluated_checks=evaluated_checks,
        total_possible_checks=total_checks,
        is_limited=not has_ext_key,
    )

    result["target_summary"] = hostname or url_string[:60]
    result["model_info"] = {
        "engine": "CyberShield Intelligent URL Heuristics & Lexical Classifier",
        "version": "1.0",
        "reputation_feed_active": has_ext_key,
        "ssrf_protected": True,
    }

    return result
