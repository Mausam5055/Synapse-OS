"""
SynapseOS — agents/orchestrator.py
Central Multi-Agent Swarm Orchestrator & StateGraph Pipeline.
Coordinates Safety Gate -> Intent Routing -> Specialist Agents (Triage, Drug, Scan, Mental) -> AI Council -> Unified LLM Synthesis.
"""

import time
import uuid
from typing import Dict, Any, List
from backend.app.core.state import SynapseOSState, AgentTraceStep
from backend.app.core.safety_router import evaluate_safety
from backend.app.agents.drug_agent import drug_agent_node
from backend.app.agents.triage_agent import triage_agent_node
from backend.app.agents.verification_agent import verification_agent_node
from backend.app.agents.scan_agent import scan_agent_node
from backend.app.agents.mental_health_agent import mental_health_node
from backend.app.agents.vaccination_agent import vaccination_agent_node
from backend.app.agents.preventive_health_agent import preventive_health_agent_node
from backend.app.agents.outbreak_agent import outbreak_agent_node
from backend.app.ml.digital_twin import compute_baseline_organ_scores, DigitalTwinInput
from backend.app.services.llm_service import call_llm


def detect_intent(text: str) -> str:
    """Classifies user query intent."""
    text_lower = (text or "").lower()
    
    if any(k in text_lower for k in ["vaccin", "uip", "u-win", "immuniz", "polio", "bcg", "pentavalent", "booster dose", "child dose"]):
        return "VACCINATION_SCHEDULE"
    elif any(k in text_lower for k in ["outbreak", "epidemic", "dengue case", "malaria surge", "cholera", "nipah", "surveillance", "hotspot"]):
        return "OUTBREAK_ALERT"
    elif any(k in text_lower for k in ["ors", "prevent", "poshan", "nutrition", "breastfeed", "anemia", "clean water", "hygiene", "mosquito net", "awareness quiz"]):
        return "PREVENTIVE_HEALTH"
    elif any(k in text_lower for k in ["xray", "x-ray", "fracture", "bone", "mri", "scan", "prescription", "report"]):
        return "SCAN_ANALYSIS"
    elif any(k in text_lower for k in ["take with", "interact", "drug", "medicine", "pill", "paracetamol", "aspirin", "dosage", "ibuprofen"]):
        return "DRUG_SAFETY"
    elif any(k in text_lower for k in ["stress", "anxious", "anxiety", "depressed", "period", "cramp", "menstrual", "sad", "hopeless"]):
        return "MENTAL_HEALTH"
    elif any(k in text_lower for k in ["digital twin", "organ twin", "vitality score", "health score", "3d twin"]):
        return "DIGITAL_TWIN"
    else:
        return "SYMPTOM_TRIAGE"


async def orchestrate_health_request(
    message: str,
    channel: str = "web",
    session_id: str = None,
    user_id: str = "demo_user"
) -> SynapseOSState:
    """
    Executes the full multi-agent DAG workflow for any user message.
    """
    if not session_id:
        session_id = str(uuid.uuid4())[:8]

    state = SynapseOSState(
        session_id=session_id,
        user_id=user_id,
        channel=channel,
        input_text=message
    )

    # 1. Deterministic Safety Gate Check
    start_time = time.time()
    safety = evaluate_safety(message)
    if not safety.is_safe:
        state.safety_cleared = False
        state.safety_message = safety.response
        if safety.category in ("crisis", "pediatric_contraindication"):
            state.detected_intent = "CRISIS_INTERVENTION" if safety.category == "crisis" else "PEDIATRIC_CONTRAINDICATION"
            state.final_response = safety.response
            state.trace.append(AgentTraceStep(
                agent_name="Deterministic Safety Gate",
                action=f"🚨 Immediate Clinical Intercept ({safety.category})",
                duration_ms=int((time.time() - start_time) * 1000),
                details={"category": safety.category}
            ))
            return state
        else:
            # Medical Emergency (chest pain, stroke, severe breathing difficulty, deep trauma)
            state.detected_intent = "EMERGENCY_TRIAGE"
            state.trace.append(AgentTraceStep(
                agent_name="Deterministic Safety Gate",
                action=f"🚨 Emergency Flag Triggered: Critical Medical Intercept Activated ({safety.category})",
                duration_ms=int((time.time() - start_time) * 1000),
                details={"category": safety.category}
            ))
            intent = "EMERGENCY_TRIAGE"
    else:
        state.trace.append(AgentTraceStep(
            agent_name="Deterministic Safety Gate",
            action="Passed safety verification protocol",
            duration_ms=int((time.time() - start_time) * 1000)
        ))
        intent = detect_intent(message)
        state.detected_intent = intent

    # 3. Dynamic Multi-Agent Execution based on Intent
    if intent == "VACCINATION_SCHEDULE":
        await vaccination_agent_node(state)
        await verification_agent_node(state)
    elif intent == "PREVENTIVE_HEALTH":
        await preventive_health_agent_node(state)
        await verification_agent_node(state)
    elif intent == "OUTBREAK_ALERT":
        await outbreak_agent_node(state)
        await verification_agent_node(state)
    elif intent == "DRUG_SAFETY":
        await drug_agent_node(state)
        await triage_agent_node(state)
        await verification_agent_node(state)
    elif intent == "SCAN_ANALYSIS":
        await scan_agent_node(state)
        await triage_agent_node(state)
        await verification_agent_node(state)
    elif intent == "MENTAL_HEALTH":
        await mental_health_node(state)
        await triage_agent_node(state)
    elif intent == "DIGITAL_TWIN":
        twin_data = compute_baseline_organ_scores(DigitalTwinInput())
        state.digital_twin = twin_data
        state.trace.append(AgentTraceStep(
            agent_name="3D Digital Health Twin Engine",
            action=f"Computed multi-organ vitality index ({twin_data['overall_health_score']}/100)",
            duration_ms=15
        ))
    else:
        # Default Full Swarm Consultation (covers EMERGENCY_TRIAGE & SYMPTOM_TRIAGE): Triage + Drug + AI Council Verification
        await triage_agent_node(state)
        await drug_agent_node(state)
        await verification_agent_node(state)

    # 4. Synthesize Final Consolidated Response via LLM (Google Gemini Hero Layer)
    synth_start = time.time()
    system_prompt = (
        "You are Sanjeevni / SynapseOS AI, an intelligent, empathetic, direct medical assistant for Indian healthcare powered by Google Gemini.\n\n"
        "STRICT CLINICAL SAFETY RULES FOR YOUR RESPONSE:\n"
        "1. BE SHORT, SIMPLE, AND TO THE POINT (under 120-150 words). Never use corporate filler or robotic preamble.\n"
        "2. PEDIATRIC DOSAGE GUARD: If the query involves a child, toddler, or infant, NEVER recommend adult tablets (such as Dolo 650 or adult NSAIDs). Mandate in-person pediatrician review for weight-based syrup. If Aspirin is asked for a child with fever, strictly warn of Reye's syndrome.\n"
        "3. HIGH-RISK & UNCERTAIN CASES: State clearly: 'This system cannot safely determine an appropriate dose. Please consult a qualified healthcare professional.'\n"
        "4. EMERGENCY NUMBERS: Always cite Indian helplines: 108 (Ambulance) and 112 (National Emergency). Never cite 911.\n"
        "5. HUMBLE FRAMING: Present output as an 'AI-assisted assessment — physician review recommended'. Never claim fake 96% confidence or council consensus.\n"
        "6. Use concise bullet points and clean mobile-friendly structure."
    )
    
    agent_findings_context = f"""
Patient Query: {message}
Vaccination Status: {state.vaccination_data}
Preventive Health Data: {state.preventive_data}
Outbreak Surveillance: {state.outbreak_data}
Triage Data: {state.triage_data}
Drug Safety: {state.drug_check}
Scan Analysis: {state.scan_analysis}
AI Council Verification: {state.verification}
"""
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Consolidate these specialist agent findings for the patient:\n{agent_findings_context}"}
    ]

    llm_synthesis = await call_llm(messages, temperature=0.2, max_tokens=450)

    if llm_synthesis and "unreachable" not in llm_synthesis.lower() and not llm_synthesis.strip().startswith('{"error":'):
        state.final_response = llm_synthesis
        state.trace.append(AgentTraceStep(
            agent_name="Swarm Synthesis & Reasoning Engine (Gemini 2.0 Flash)",
            action="Synthesized multi-agent findings into grounded clinical guidance",
            duration_ms=int((time.time() - synth_start) * 1000)
        ))
    else:
        # Structured fallback if no LLM key configured
        parts = []
        if state.vaccination_data:
            v_data = state.vaccination_data
            parts.append(f"**💉 UIP Vaccination Status:** Next Due: **{v_data.get('next_vaccine_due')}** ({v_data.get('next_due_date')})")
            parts.append(f"• **National Immunization Progress:** {v_data.get('uip_compliance_pct', 100)}% UIP Milestones Completed")
            parts.append(f"• **Registry Node:** {v_data.get('registry', 'U-WIN MoHFW')}")

        if state.preventive_data and state.preventive_data.get("active_guide"):
            p_guide = state.preventive_data["active_guide"]
            parts.append(f"\n**🌿 Preventive Healthcare Directive: {p_guide.get('title')}**")
            for step in p_guide.get("actionable_steps", [])[:3]:
                parts.append(f"• {step}")
            parts.append(f"⚠️ *Red Flags:* {p_guide.get('red_flags')}")

        if state.outbreak_data and state.outbreak_data.get("data"):
            o_data = state.outbreak_data["data"]
            parts.append(f"\n**🚨 District Outbreak Alert ({o_data.get('district')}):** {o_data.get('risk_badge')}")
            parts.append(f"• **Active Pathogen:** {o_data.get('primary_outbreak')} ({o_data.get('velocity_pct')})")
            parts.append(f"• **Advisory:** {o_data.get('preventive_advisory')}")

        if state.triage_data:
            parts.append(f"\n**Triage Assessment:** {state.triage_data.get('urgency_badge')}")
            parts.append(f"{state.triage_data.get('recommended_action')}")
            if state.triage_data.get("recommended_specialist"):
                parts.append(f"• **Recommended Care:** {state.triage_data['recommended_specialist']}")

            from backend.app.core.safety_router import is_pediatric_query
            is_child = is_pediatric_query(message)
            t_level = state.triage_data.get("triage_level", "HOME_CARE")

            if is_child:
                parts.append(
                    "\n**👶 Pediatric Safety Guidance:**\n"
                    "• ⚠️ *Strict Warning:* Never administer adult tablets (such as Dolo 650 or adult NSAIDs) to young children or toddlers.\n"
                    "• *Dosage Caution:* This system cannot safely determine an appropriate pediatric dose. Children require exact weight-based pediatric drops or syrup prescribed by a pediatrician.\n"
                    "• *Action:* Please consult a qualified pediatrician immediately."
                )
            elif t_level == "EMERGENCY_CARE":
                parts.append(
                    "\n**💊 Medications & Relief (India):**\n"
                    "• ⚠️ *Strictly Withhold Oral Self-Medication:* Do not administer painkillers, anti-emetics, or sedatives prior to medical examination (masks acute surgical and neurological signs).\n"
                    "• *At Hospital:* Call 108 for emergency ambulance; emergency stabilization will be administered on arrival."
                )
            elif any(k in message.lower() for k in ["fever", "bukhar", "pain", "headache", "body ache", "cramp"]):
                parts.append(
                    "\n**💊 Medications & Relief (India — Adult Reference Only):**\n"
                    "• *Dolo 650 (Paracetamol 650mg):* 1 tablet after meals (with water) for adult fever/pain (max 3/day).\n"
                    "• *Electral ORS:* 1 packet in 1L clean drinking water; sip throughout the day for active hydration.\n"
                    "• *Pan-40 (Pantoprazole):* 1 tablet 30 minutes before breakfast on empty stomach if gastric acidity occurs."
                )

        if state.drug_check and state.drug_check.get("detected_medications"):
            meds = ", ".join(state.drug_check["detected_medications"])
            parts.append(f"\n**Medication Scan:** Detected {meds}")
            if state.drug_check.get("interactions_count", 0) > 0:
                for item in state.drug_check["interactions"]:
                    parts.append(f"⚠️ **Warning ({item.get('severity', 'Risk')}):** {item.get('effect')} — *{item.get('recommended_action')}*")
            else:
                parts.append("ℹ️ No critical interactions flagged in basic screening — physician review advised.")

        if state.scan_analysis:
            parts.append(f"\n**Imaging Summary:** {state.scan_analysis.get('ai_diagnosis_summary')}")
            parts.append(f"*{state.scan_analysis.get('plain_english_explanation')}*")

        if state.verification:
            verdict = state.verification.get("council_verdict", "Multi-agent safety review completed.")
            parts.append(f"\n**🩺 AI-Assisted Assessment:** {verdict} (Physician review recommended)")

        state.final_response = "\n\n".join(parts)

    state.suggested_actions = [
        "View 3D Digital Health Twin",
        "Generate Verifiable Health Passport (QR)",
        "Check Universal Immunization Schedule",
        "View District Outbreak Early Warning"
    ]

    return state
