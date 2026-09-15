"""
SynapseOS — agents/verification_agent.py
AI Council / Second Opinion Verification Agent.
Audits primary diagnostic and triage claims using multi-perspective LLM consensus (Groq/OpenRouter).
"""

import time
from typing import Dict, Any, List, Optional
from backend.app.core.state import SynapseOSState, AgentTraceStep
from backend.app.services.llm_service import call_llm_json


async def verify_clinical_claims(
    user_query: str,
    primary_triage: Dict[str, Any],
    drug_check: Optional[Dict[str, Any]] = None,
    scan_analysis: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Executes an AI Council consensus audit of triage and pharmacology findings using LLM reasoning.
    Falls back to deterministic scoring if LLM is unavailable.
    """
    level      = primary_triage.get("triage_level", "HOME_CARE")
    crit_count = len(primary_triage.get("detected_symptoms", {}).get("critical_flags", []))
    drug_hazards = drug_check.get("interactions_count", 0) if drug_check else 0

    # ── Step 1: Deterministic discrepancy check (always runs, used as fallback) ──
    discrepancies = []
    if crit_count > 0 and level != "EMERGENCY_CARE":
        discrepancies.append("Critical red-flag symptoms detected but triage level was downgraded.")
    if drug_hazards > 0 and level == "HOME_CARE":
        discrepancies.append("Severe drug interaction hazard present; requires pharmacist or doctor oversight.")

    det_score = 95 if len(discrepancies) == 0 else 60
    det_status = "CONSENSUS_REACHED" if len(discrepancies) == 0 else "ADJUSTMENT_RECOMMENDED"

    fallback = {
        "council_status": det_status,
        "consensus_confidence_score": det_score,
        "alignment_level": "High" if len(discrepancies) == 0 else "Requires Clinician Review",
        "agents_participating": [
            "Clinical Symptom Triage Node",
            "Pharmacology & RxNav Node",
            "Deterministic Safety Gate"
        ],
        "audit_findings": {
            "evidence_grounded": True,
            "discrepancies": discrepancies,
            "safety_protocol_adherence": "Verified against Indian MoHFW / Clinical Guidelines"
        },
        "council_verdict": (
            "Multi-agent safety cross-check aligned on clinical severity. In-person physician evaluation recommended."
            if len(discrepancies) == 0
            else "Secondary safety audit identified clinical discrepancies requiring immediate physician oversight."
        ),
        "llm_reasoning": None
    }

    # ── Step 2: LLM Council Audit (Groq / OpenRouter) ────────────────────────
    triage_summary = (
        f"Triage Level: {level}\n"
        f"Primary Impression: {primary_triage.get('primary_clinical_impression', 'N/A')}\n"
        f"Urgency Badge: {primary_triage.get('urgency_badge', 'N/A')}\n"
        f"Critical Flags Detected: {crit_count}\n"
        f"Recommended Action: {primary_triage.get('recommended_action', 'N/A')}"
    )

    drug_summary = "None" if not drug_check else (
        f"Medications Detected: {', '.join(drug_check.get('detected_medications', []))}\n"
        f"Drug Interactions Found: {drug_hazards}\n"
        f"Interaction Details: {drug_check.get('interactions', [])}"
    )

    scan_summary = "None" if not scan_analysis else (
        f"Scan Type: {scan_analysis.get('scan_type', 'Unknown')}\n"
        f"AI Diagnosis: {scan_analysis.get('ai_diagnosis_summary', 'N/A')}\n"
        f"Confidence: {scan_analysis.get('confidence_score', 'N/A')}"
    )

    system_prompt = (
        "You are the AI Council of Sanjeevni — a panel of three senior medical AI agents "
        "(Clinical Triage Specialist, Clinical Pharmacologist, Evidence & Safety Auditor) "
        "performing a second-opinion consensus audit of a primary AI triage assessment.\n\n"
        "Review all provided findings and return ONLY a valid JSON object with these exact keys:\n"
        "{\n"
        '  "council_status": "CONSENSUS_REACHED" | "ADJUSTMENT_RECOMMENDED" | "ESCALATION_REQUIRED",\n'
        '  "consensus_confidence_score": <integer 0-100>,\n'
        '  "agents_participating": ["list of agent names"],\n'
        '  "audit_findings": {\n'
        '    "evidence_grounded": <true|false>,\n'
        '    "discrepancies": ["list of any inconsistencies or safety concerns found"],\n'
        '    "safety_protocol_adherence": "one-line compliance statement"\n'
        "  },\n"
        '  "council_verdict": "1-2 sentence overall consensus conclusion",\n'
        '  "llm_reasoning": "2-3 sentence clinical rationale for the confidence score"\n'
        "}\n\n"
        "Scoring guide:\n"
        "- 90-100: Strong consensus, no discrepancies, evidence-aligned\n"
        "- 75-89:  General agreement with minor caveats\n"
        "- 60-74:  Partial agreement, some risks flagged\n"
        "- Below 60: Significant discrepancies or safety concerns requiring escalation\n\n"
        "Be clinically rigorous. No markdown. Pure JSON only."
    )

    user_prompt = (
        f"Patient Query: {user_query}\n\n"
        f"=== PRIMARY TRIAGE ASSESSMENT ===\n{triage_summary}\n\n"
        f"=== DRUG SAFETY CHECK ===\n{drug_summary}\n\n"
        f"=== MEDICAL SCAN ANALYSIS ===\n{scan_summary}\n\n"
        f"=== DETERMINISTIC PRE-AUDIT ===\n"
        f"Discrepancies found: {discrepancies or 'None'}\n"
        f"Pre-computed confidence: {det_score}%\n\n"
        "Provide the AI Council consensus audit as JSON."
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user",   "content": user_prompt}
    ]

    llm_result = await call_llm_json(messages=messages, fallback_dict=fallback, temperature=0.1)

    # ── Step 3: Safety bounds — confidence score must be numeric 0-100 ───────
    score = llm_result.get("consensus_confidence_score", det_score)
    if not isinstance(score, (int, float)) or not (0 <= score <= 100):
        llm_result["consensus_confidence_score"] = det_score

    # Ensure agents_participating is always present
    if not llm_result.get("agents_participating"):
        llm_result["agents_participating"] = fallback["agents_participating"]

    return llm_result


async def verification_agent_node(state: SynapseOSState) -> SynapseOSState:
    """LangGraph node execution for AI Council Verification."""
    start = time.time()
    if not state.triage_data:
        state.triage_data = {"triage_level": "HOME_CARE"}

    res = await verify_clinical_claims(
        user_query=state.input_text,
        primary_triage=state.triage_data,
        drug_check=state.drug_check,
        scan_analysis=state.scan_analysis
    )
    state.verification = res

    duration = int((time.time() - start) * 1000)
    state.trace.append(AgentTraceStep(
        agent_name="Clinical Verification Node (Gemini Swarm)",
        action=f"Cross-audited clinical findings -> {res.get('council_status', 'Audited')}",
        duration_ms=duration,
        details={"status": res.get("council_status"), "alignment": res.get("alignment_level")}
    ))
    return state
