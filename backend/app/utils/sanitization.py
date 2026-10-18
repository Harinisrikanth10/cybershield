import html
import re

SENSITIVE_PATTERNS = [
    (re.compile(r'(?i)(password|passwd|pwd)\s*[:=]\s*["\']?([^"\'\s]+)["\']?'), r'\1: [REDACTED]'),
    (re.compile(r'(?i)(bearer|token|api[_-]?key)\s*[:=]\s*["\']?([a-zA-Z0-9_\-\.]{8,})["\']?'), r'\1: [REDACTED]'),
    (re.compile(r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b'), r'[CREDIT CARD REDACTED]'),
    (re.compile(r'\b\d{3}-\d{2}-\d{4}\b'), r'[SSN REDACTED]'),
]

def sanitize_text(text: str) -> str:
    """Escapes HTML entities to prevent stored XSS attacks."""
    if not text:
        return ""
    return html.escape(text.strip())

def redact_sensitive_data(text: str) -> str:
    """Redacts passwords, tokens, API keys, and sensitive financial data."""
    if not text:
        return ""
    redacted = text
    for pattern, replacement in SENSITIVE_PATTERNS:
        redacted = pattern.sub(replacement, redacted)
    return redacted

def create_safe_preview(text: str, max_length: int = 160) -> str:
    """Returns a sanitized, redacted, truncated snippet safe for summaries."""
    if not text:
        return ""
    redacted = redact_sensitive_data(text)
    clean = sanitize_text(redacted)
    if len(clean) > max_length:
        return clean[:max_length] + "..."
    return clean
