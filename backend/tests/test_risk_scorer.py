import pytest
from app.services.risk_scorer import RiskScoringEngine

def test_risk_scorer_bands():
    engine = RiskScoringEngine(low_max=24, medium_max=49, high_max=74)
    assert engine.classify_band(0) == "Low"
    assert engine.classify_band(24) == "Low"
    assert engine.classify_band(25) == "Moderate"
    assert engine.classify_band(49) == "Moderate"
    assert engine.classify_band(50) == "High"
    assert engine.classify_band(74) == "High"
    assert engine.classify_band(75) == "Critical"
    assert engine.classify_band(100) == "Critical"

def test_risk_scorer_deduplication():
    engine = RiskScoringEngine()
    signals = [
        {"id": "s1", "category": "urgency", "weight": 15, "title": "Urgency 1", "severity": "medium"},
        {"id": "s2", "category": "urgency", "weight": 25, "title": "Urgency 2", "severity": "high"},
    ]
    res = engine.compute_risk(
        signals=signals,
        observed_facts=[],
        evaluated_checks=5,
        total_possible_checks=10,
        is_limited=False,
    )
    # The deduplication should only count the highest weight (25), not sum them to 40
    assert res["risk_score"] == 25
    assert len(res["findings"]) == 1
    assert res["findings"][0]["title"] == "Urgency 2"

def test_risk_scorer_missing_signals():
    engine = RiskScoringEngine()
    res = engine.compute_risk(
        signals=[],
        observed_facts=[],
        evaluated_checks=0,
        total_possible_checks=10,
        is_limited=True,
    )
    assert res["risk_score"] == 0
    assert res["risk_category"] == "Low"
    assert res["status"] == "limited"
    assert len(res["limitations"]) > 0
