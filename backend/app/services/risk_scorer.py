from typing import List, Dict, Any, Optional, Tuple
from app.core.config import settings

class RiskScoringEngine:
    """
    Dedicated testable risk scoring service.
    Combines weighted signals, de-duplicates correlated indicators,
    calculates calibrated risk bands and confidence measures,
    and documents model limitations.
    """

    def __init__(
        self,
        low_max: Optional[int] = None,
        medium_max: Optional[int] = None,
        high_max: Optional[int] = None,
    ):
        self.low_max = low_max if low_max is not None else settings.RISK_BAND_LOW_MAX
        self.medium_max = medium_max if medium_max is not None else settings.RISK_BAND_MEDIUM_MAX
        self.high_max = high_max if high_max is not None else settings.RISK_BAND_HIGH_MAX

    def classify_band(self, score: int) -> str:
        """Categorizes an integer score into a presentation band."""
        clamped_score = max(0, min(100, score))
        if clamped_score <= self.low_max:
            return "Low"
        elif clamped_score <= self.medium_max:
            return "Moderate"
        elif clamped_score <= self.high_max:
            return "High"
        else:
            return "Critical"

    def compute_risk(
        self,
        signals: List[Dict[str, Any]],
        observed_facts: List[Dict[str, Any]],
        evaluated_checks: int,
        total_possible_checks: int,
        is_limited: bool = False,
    ) -> Dict[str, Any]:
        """
        Combines weighted signals with deduplication and confidence calibration.

        Signal format:
        {
            "id": str,
            "category": str,        # e.g., 'urgency', 'credential_harvest', 'domain_entropy'
            "weight": int,          # points contribution (0-40)
            "title": str,
            "description": str,
            "severity": str,        # 'low', 'medium', 'high', 'critical'
            "confidence": float,
        }
        """
        # 1. De-duplicate signals by category to avoid double-counting correlated indicators
        seen_categories: Dict[str, Dict[str, Any]] = {}
        deduped_signals: List[Dict[str, Any]] = []

        for sig in signals:
            cat = sig.get("category", sig.get("id"))
            if cat not in seen_categories:
                seen_categories[cat] = sig
                deduped_signals.append(sig)
            else:
                # If a stronger signal in the same category exists, keep the higher weight
                existing = seen_categories[cat]
                if sig.get("weight", 0) > existing.get("weight", 0):
                    deduped_signals.remove(existing)
                    seen_categories[cat] = sig
                    deduped_signals.append(sig)

        # 2. Sum weights with compounding penalty for multiple high-severity signals
        raw_score = sum(s.get("weight", 0) for s in deduped_signals)
        high_severity_count = sum(1 for s in deduped_signals if s.get("severity") in ("high", "critical"))
        if high_severity_count >= 2:
            raw_score += 10
        if high_severity_count >= 3:
            raw_score += 15

        final_score = max(0, min(100, int(round(raw_score))))
        risk_category = self.classify_band(final_score)

        # 3. Calculate calibrated confidence based on check coverage
        coverage_ratio = (
            (evaluated_checks / total_possible_checks)
            if total_possible_checks > 0
            else 0.5
        )
        base_confidence = 0.5 + (0.45 * coverage_ratio)
        if is_limited:
            base_confidence = min(base_confidence, 0.65)
        
        calibrated_confidence = round(max(0.2, min(0.98, base_confidence)), 2)

        # 4. Formulate findings (inferred judgments)
        findings = []
        for s in deduped_signals:
            findings.append({
                "id": s.get("id", "finding"),
                "title": s.get("title", "Detected Indicator"),
                "description": s.get("description", ""),
                "severity": s.get("severity", "medium"),
                "category": s.get("category", "general"),
                "confidence": s.get("confidence", 0.85),
            })

        # 5. Formulate observed evidence (factual data observed)
        evidence = []
        for fact in observed_facts:
            evidence.append({
                "signal_name": fact.get("name", "Observation"),
                "observation": fact.get("detail", ""),
                "raw_value": str(fact.get("value", "")),
                "impact": fact.get("impact", "neutral"),
            })

        # 6. Generate actionable, prioritized recommendations
        recommendations = self.generate_recommendations(risk_category, deduped_signals)

        # 7. Explicit model limitations
        limitations = self.generate_limitations(is_limited, evaluated_checks, total_possible_checks)

        return {
            "risk_score": final_score,
            "risk_category": risk_category,
            "confidence_score": calibrated_confidence,
            "status": "limited" if is_limited else "completed",
            "findings": findings,
            "evidence": evidence,
            "recommendations": recommendations,
            "limitations": limitations,
        }

    def generate_recommendations(self, risk_category: str, signals: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        recs = []
        if risk_category in ("High", "Critical"):
            recs.append({
                "action": "Do Not Interact or Provide Information",
                "priority": "urgent",
                "detail": "Do not click links, download attachments, send funds, or reply with credentials or OTPs.",
            })
            recs.append({
                "action": "Verify Through Independent Official Channel",
                "priority": "high",
                "detail": "If this claims to be from a bank, company, or friend, contact them directly via known official contact numbers, not using contact details from this item.",
            })
            recs.append({
                "action": "Report to Cybersecurity Incident Team",
                "priority": "recommended",
                "detail": "Report the sender or domain to your organization's IT department or the relevant anti-phishing authority.",
            })
        elif risk_category == "Moderate":
            recs.append({
                "action": "Exercise Heightened Caution",
                "priority": "high",
                "detail": "Inspect sender identity, links, and domain age carefully before proceeding.",
            })
            recs.append({
                "action": "Check for Unexpected Urgency or Inconsistencies",
                "priority": "recommended",
                "detail": "Legitimate organizations rarely demand instant action under threat of sudden account closure.",
            })
        else:
            recs.append({
                "action": "Routine Vigilance Advised",
                "priority": "informational",
                "detail": "No dominant indicators of active compromise were detected, but always confirm unusual requests through standard channels.",
            })
        return recs

    def generate_limitations(self, is_limited: bool, evaluated: int, total: int) -> List[str]:
        limits = [
            f"Evaluated {evaluated} out of {total} recognized indicator dimensions.",
            "Heuristic analysis does not guarantee complete absence of zero-day exploits or newly registered attack infrastructure.",
            "Risk scores represent calculated threat probability based on inspected signals, not legal or definitive proof of malice or innocence.",
        ]
        if is_limited:
            limits.insert(
                0,
                "Limited Analysis: External reputation or full multimodal deepfake models are currently operating in lightweight/heuristic fallback mode."
            )
        return limits

risk_engine = RiskScoringEngine()
