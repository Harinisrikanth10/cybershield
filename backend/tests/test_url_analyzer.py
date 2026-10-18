import pytest
from app.services.url_analyzer import analyze_url
from app.utils.ssrf import validate_url_safety

def test_ssrf_protection_loopback():
    is_safe, msg, ip = validate_url_safety("http://127.0.0.1:8000/admin")
    assert is_safe is False
    assert "loopback" in msg.lower() or "restricted" in msg.lower()

def test_ssrf_protection_private_ip():
    is_safe, msg, ip = validate_url_safety("http://192.168.1.1/router")
    assert is_safe is False
    assert "private network" in msg.lower() or "restricted" in msg.lower()

def test_ssrf_protection_cloud_metadata():
    is_safe, msg, ip = validate_url_safety("http://169.254.169.254/latest/meta-data/")
    assert is_safe is False

def test_phishing_brand_spoofing():
    res = analyze_url("https://paypal.com.account-update.xyz/login")
    assert res["risk_score"] >= 50
    assert any("brand" in f["category"].lower() or "brand" in f["title"].lower() for f in res["findings"])

def test_legitimate_url():
    res = analyze_url("https://www.google.com/search?q=cybersecurity")
    assert res["risk_category"] == "Low"
    assert res["risk_score"] <= 24
