import pytest
from app.services.text_analyzer import analyze_text

def test_text_analyzer_phishing():
    scam_text = "URGENT: Your bank account is locked! Send your password and OTP immediately to verify your identity or your account will be suspended in 24 hours."
    res = analyze_text(scam_text)
    assert res["risk_score"] >= 50
    assert res["risk_category"] in ("High", "Critical")
    assert any(f["category"] == "credential_harvesting" for f in res["findings"])

def test_text_analyzer_benign():
    benign_text = "Hi Sarah, can you please review the attached quarterly slide deck when you get a chance? Thanks, Alex."
    res = analyze_text(benign_text)
    assert res["risk_score"] <= 24
    assert res["risk_category"] == "Low"
