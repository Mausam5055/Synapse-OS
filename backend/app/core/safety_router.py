"""
SynapseOS — core/safety_router.py
Deterministic pre-pipeline safety gate: crisis detection, emergency detection,
disclaimer, and input sanitisation.
No LLM ever overrides these outcomes — keyword and pattern matching only.
Adapted and enhanced from MediGenius for SynapseOS.
"""

import re
from typing import Dict, Optional, Tuple

HELPLINES = {
    "IN": {
        "crisis_name": "Tele-MANAS (Govt of India)",
        "crisis_contact": "14416 (toll-free, 24/7) or KIRAN at 1800-599-0019",
        "emergency": "112 or 108 (National Emergency / Ambulance)",
    },
    "US": {
        "crisis_name": "988 Suicide & Crisis Lifeline",
        "crisis_contact": "Call or text 988 (24/7)",
        "emergency": "911",
    },
    "UK": {
        "crisis_name": "Samaritans",
        "crisis_contact": "116 123 (free, 24/7)",
        "emergency": "999 or 112",
    },
    "BD": {
        "crisis_name": "Kaan Pete Roi",
        "crisis_contact": "09612-119911 (3 PM-3 AM daily)",
        "emergency": "999",
    }
}
INTERNATIONAL_DIRECTORY = "findahelpline.com"


def _build_crisis_response(country: str = "IN") -> str:
    h = HELPLINES.get(country, HELPLINES["IN"])
    return (
        "🚨 **Immediate Support Available**\n\n"
        "I'm really glad you reached out, and I want you to be safe. You deserve support from a caring, trained professional right now, not an automated system.\n\n"
        f"• **Crisis Helpline:** {h['crisis_name']} — **{h['crisis_contact']}**\n"
        f"• **Immediate Danger / Emergency:** Call **{h['emergency']}**\n"
        f"• **International Support:** Visit [{INTERNATIONAL_DIRECTORY}](https://findahelpline.com) for confidential 24/7 support in any region.\n\n"
        "Please connect with someone who can help. You do not have to carry this alone."
    )


def _build_emergency_response(country: str = "IN") -> str:
    h = HELPLINES.get(country, HELPLINES["IN"])
    return (
        "⚠️ **POTENTIAL MEDICAL EMERGENCY**\n\n"
        "The symptoms or situation you described require immediate professional in-person medical attention.\n\n"
        f"• **Call Emergency Services immediately:** **{h['emergency']}**\n"
        "• Proceed to the nearest hospital emergency room (ER) or urgent care facility.\n\n"
        "SynapseOS AI cannot safely diagnose or treat acute emergencies. Please seek immediate help."
    )


CRISIS_PATTERNS = [
    r"kill myself", r"end my life", r"end it all", r"want to die", r"wish i (was|were) dead",
    r"don'?t want to (live|be alive)", r"no reason to live", r"better off dead",
    r"take my (own )?life", r"suicidal", r"suicide", r"self.?harm", r"cutting myself",
    r"hurt myself on purpose", r"can'?t go on", r"can'?t take (it|this) anymore",
    r"not worth living", r"planning to (kill myself|end my life)", r"goodbye forever",
    r"want to overdose", r"planning to overdose", r"overdose on purpose",
    r"swallow all (my|the) pills", r"take all (my|the) pills", r"enough pills to die",
    r"hanging myself", r"jump off", r"shoot myself", r"bleed out",
]

EMERGENCY_PATTERNS = [
    r"chest pain", r"crushing chest", r"heart attack", r"can'?t breathe", r"cannot breathe",
    r"trouble breathing", r"severe shortness of breath", r"choking", r"face drooping",
    r"arm weakness", r"slurred speech", r"stroke symptoms", r"coughing up blood",
    r"vomiting blood", r"severe burn", r"deep wound", r"heavy bleeding",
    r"unconscious", r"passed out", r"won'?t wake up", r"seizure", r"convulsing",
    r"anaphylaxis", r"throat closing", r"swollen airway", r"sudden severe headache",
    r"thunderclap headache", r"poisoning", r"swallowed poison", r"overdosed",
]

PEDIATRIC_AGE_PATTERNS = [
    r"\b(child|children|kid|kids|toddler|toddlers|infant|infants|baby|babies|newborn|neonate)\b",
    r"\b(\d+)\s*(-|\s)?(year|yr|month|mo|week|wk)s?\s*(old)?\b",
    r"\b(pediatric|paediatric)\b",
    r"\b(baccha|bacche|chota baccha|shishu)\b"
]

ASPIRIN_PATTERNS = [
    r"\b(aspirin|disprin|ecosprin|acetylsalicylic|asa)\b"
]

VIRAL_OR_FEVER_PATTERNS = [
    r"\b(fever|viral|flu|cold|cough|chickenpox|varicella|influenza|bukhār|bukhar)\b"
]


def is_pediatric_query(text: str) -> bool:
    """Checks whether the query pertains to a child or infant."""
    normalized = (text or "").lower()
    for pattern in PEDIATRIC_AGE_PATTERNS:
        match = re.search(pattern, normalized)
        if match:
            # If matched digit-year-old, check if <= 14 years
            groups = match.groups()
            if len(groups) >= 3 and groups[2] in ("year", "yr"):
                try:
                    age = int(groups[0])
                    if age > 14:
                        continue
                except Exception:
                    pass
            return True
    return False


def check_pediatric_aspirin_risk(text: str) -> Optional[str]:
    """
    Checks for the lethal pediatric contraindication of Aspirin in children with viral illness / fever (Reye's Syndrome).
    """
    normalized = (text or "").lower()
    has_pediatric = is_pediatric_query(normalized)
    has_aspirin = any(re.search(p, normalized) for p in ASPIRIN_PATTERNS)
    has_fever_or_viral = any(re.search(p, normalized) for p in VIRAL_OR_FEVER_PATTERNS)

    if has_pediatric and has_aspirin:
        return (
            "🚨 **CRITICAL MEDICAL CONTRAINDICATION: DO NOT GIVE ASPIRIN TO CHILDREN**\n\n"
            "• **Lethal Risk of Reye's Syndrome:** Aspirin (acetylsalicylic acid / Disprin) must **NEVER** be given to children, "
            "toddlers, or teenagers suffering from fever or viral infections (flu, chickenpox). It triggers **Reye's Syndrome**, "
            "a rapid, life-threatening condition causing acute brain swelling (encephalopathy) and fatal liver failure.\n\n"
            "• **Immediate Action:**\n"
            "  1. **Strictly Withhold Aspirin:** Do not administer any dose of Aspirin, Disprin, or Ecosprin.\n"
            "  2. **Pediatrician Consultation:** For fever relief, pediatric formulations (such as weight-based Paracetamol drops/syrup) "
            "must be calculated strictly by a qualified doctor based on the child's exact body weight in kilograms.\n"
            "  3. **Emergency Care:** If Aspirin was already given and the child exhibits vomiting, extreme lethargy, confusion, or seizures, "
            "proceed immediately to a pediatric emergency room or call **108 (Ambulance) / 112**."
        )
    return None


class SafetyCheckResult:
    def __init__(
        self,
        is_safe: bool,
        category: str = "safe",
        response: Optional[str] = None,
        is_pediatric: bool = False
    ):
        self.is_safe = is_safe
        self.category = category  # 'safe', 'crisis', 'emergency', 'pediatric_contraindication'
        self.response = response
        self.is_pediatric = is_pediatric


def evaluate_safety(text: str, country: str = "IN") -> SafetyCheckResult:
    """
    Deterministic safety evaluation.
    Evaluates:
    1. Crisis / Self-harm patterns
    2. Critical Pediatric Contraindications (e.g. Aspirin Reye's Syndrome)
    3. Acute Emergency / Trauma patterns
    4. Pediatric tagging
    """
    normalized = (text or "").lower().strip()
    if not normalized:
        return SafetyCheckResult(is_safe=True)

    # 1. Immediate Crisis Check
    for pattern in CRISIS_PATTERNS:
        if re.search(pattern, normalized):
            return SafetyCheckResult(
                is_safe=False,
                category="crisis",
                response=_build_crisis_response(country),
                is_pediatric=is_pediatric_query(normalized)
            )

    # 2. Critical Pediatric Contraindication (Aspirin -> Reye's Syndrome)
    pediatric_aspirin_warning = check_pediatric_aspirin_risk(normalized)
    if pediatric_aspirin_warning:
        return SafetyCheckResult(
            is_safe=False,
            category="pediatric_contraindication",
            response=pediatric_aspirin_warning,
            is_pediatric=True
        )

    # 3. Acute Emergency Check
    for pattern in EMERGENCY_PATTERNS:
        if re.search(pattern, normalized):
            return SafetyCheckResult(
                is_safe=False,
                category="emergency",
                response=_build_emergency_response(country),
                is_pediatric=is_pediatric_query(normalized)
            )

    return SafetyCheckResult(
        is_safe=True,
        category="safe",
        is_pediatric=is_pediatric_query(normalized)
    )
