# 🤖 Synapse-OS — AI Swarm Agent Explanation

> **File:** `docs/agent_explanation.md`
> **Last Updated:** September 2026
> **Code References:** `backend/app/agents/`, `backend/app/core/`, `backend/app/services/llm_service.py`

---

## Overview

The Synapse-OS **Multi-Agent Clinical Swarm** is the core intelligence engine of the platform. Instead of routing every health question to a single AI model, it uses a **Directed Acyclic Graph (DAG)** pipeline of **5 specialized agents** that work in sequence, each contributing a specific type of clinical expertise before a final Groq LLM synthesizes a unified, safe, and accurate response.

This architecture is inspired by real hospital consultation workflows — the way a general physician, specialist, pharmacist, and audit panel collaborate before giving a patient a final treatment plan.

---

## Architecture at a Glance

```
User Query (Web / WhatsApp / SMS)
        │
        ▼
┌──────────────────────────────────────────────────────────────────┐
│  SYNAPSE-OS SWARM DAG PIPELINE                                   │
│                                                                  │
│  [1] 🛡️  Safety Gate        ──► Emergency / Crisis? → Stop early │
│           (deterministic)                                        │
│                │ SAFE                                            │
│                ▼                                                 │
│  [2] 🧭  Intent Classifier  ──► What type of query?              │
│           (keyword routing)                                      │
│                │                                                 │
│                ▼                                                 │
│  [3] 🩺  Specialist Agents  ──► Based on intent, routes to:      │
│           (LLM + rules)         • Clinical Triage Agent          │
│                                 • Drug Safety Agent (RxNav)      │
│                                 • Vaccination Agent              │
│                                 • Preventive Health Agent        │
│                                 • Outbreak Agent                 │
│                                 • Mental Health Agent            │
│                                 • Medical Scan Agent             │
│                                 • Digital Twin Engine            │
│                │                                                 │
│                ▼                                                 │
│  [4] ⚖️   AI Council         ──► Cross-verify all findings       │
│           (verification)         → Consensus score %             │
│                │                                                 │
│                ▼                                                 │
│  [5] 🧠  Groq LLM Synthesis ──► Consolidate → Final Response    │
│           (Qwen 27B / GPT-OSS 120B / LLaMA 70B)                 │
└──────────────────────────────────────────────────────────────────┘
        │
        ▼
Final Answer + Agent Trace (latency per agent shown in UI)
```

---

## Agent 1 — Safety Gate

**File:** [`backend/app/core/safety_router.py`](../backend/app/core/safety_router.py)

### What it does
The Safety Gate is the **first and non-negotiable** checkpoint. It runs **before any LLM is called**, using deterministic regex pattern matching only — no AI model is involved here.

### Why no AI?
Speed and reliability. An AI model can be uncertain or slow. A regex pattern is instant and 100% predictable. Life-safety decisions must never rely on probabilistic AI outputs.

### Two types of interception

**Crisis Interception (Mental Health):**
Triggered by ~20 patterns including:
```
"kill myself", "want to die", "suicidal", "self-harm",
"can't go on", "not worth living", "planning to overdose"...
```
**Response:** Immediately shows Indian crisis helpline — Tele-MANAS (14416) and KIRAN (1800-599-0019). Stops the pipeline entirely.

**Emergency Interception (Medical):**
Triggered by ~20 patterns including:
```
"chest pain", "heart attack", "can't breathe", "seizure",
"vomiting blood", "unconscious", "anaphylaxis", "face drooping"...
```
**Response:** Shows "Call 112 / 108 immediately" and directs to the nearest ER. The pipeline may still continue for drug safety checks but the emergency response is prioritized.

### Output
```python
SafetyCheckResult(
    is_safe = True/False,
    category = "safe" | "crisis" | "emergency",
    response = "..."  # pre-built message if not safe
)
```

---

## Agent 2 — Intent Classifier

**File:** [`backend/app/agents/orchestrator.py`](../backend/app/agents/orchestrator.py) → `detect_intent()`

### What it does
Also **deterministic** (no LLM). Reads the user's message and classifies it into one of 8 intents using keyword matching.

### Intent Routing Table

| Keywords Detected | Intent Assigned | Agents Activated |
|---|---|---|
| "vaccin", "polio", "BCG", "booster", "UIP" | `VACCINATION_SCHEDULE` | Vaccination + Verification |
| "outbreak", "epidemic", "dengue", "cholera", "surveillance" | `OUTBREAK_ALERT` | Outbreak + Verification |
| "ORS", "nutrition", "mosquito net", "hygiene", "anemia" | `PREVENTIVE_HEALTH` | Preventive + Verification |
| "xray", "MRI", "scan", "prescription", "report", "fracture" | `SCAN_ANALYSIS` | Scan + Triage + Verification |
| "drug", "aspirin", "warfarin", "interact", "dosage", "pill" | `DRUG_SAFETY` | Drug + Triage + Verification |
| "stress", "anxiety", "depressed", "period", "hopeless" | `MENTAL_HEALTH` | Mental Health + Triage |
| "digital twin", "organ twin", "vitality score" | `DIGITAL_TWIN` | Digital Twin Engine |
| *(anything else / emergency)* | `SYMPTOM_TRIAGE` | Triage + Drug + Verification |

### Design Note
The intent classifier uses an **ordered if-elif chain** — the first matching keyword wins. More specific conditions (vaccination, outbreak) are checked before generic ones (symptoms).

---

## Agent 3 — Clinical Triage Agent

**File:** [`backend/app/agents/triage_agent.py`](../backend/app/agents/triage_agent.py)

### What it does
Analyses symptom severity and classifies the patient's situation into one of three urgency levels.

### Symptom Taxonomy

```python
SYMPTOM_TAXONOMY = {
    "red_flags": [            # → EMERGENCY_CARE
        "chest pain", "shortness of breath", "unconscious",
        "hemoptysis", "anaphylaxis", "cyanosis", "seizure",
        "severe head injury", "sudden paralysis"...
    ],
    "amber_flags": [          # → DOCTOR_CONSULT
        "fever over 102", "persistent vomiting", "jaundice",
        "blood in stool", "severe abdominal pain", "joint swelling"...
    ],
    "green_flags": [          # → HOME_CARE
        "mild headache", "runny nose", "sore throat",
        "dry cough", "indigestion", "fatigue"...
    ]
}
```

### Urgency Levels & Actions

| Level | Badge | Action |
|---|---|---|
| `EMERGENCY_CARE` | 🔴 Emergency | Go to ER / call 112 immediately |
| `DOCTOR_CONSULT` | 🟡 Consult Needed | See a doctor within 24–48 hours |
| `HOME_CARE` | 🟢 Self-Care | Rest, hydrate, OTC meds |

### Output
```json
{
  "triage_level": "EMERGENCY_CARE",
  "urgency_badge": "🔴 Emergency Care (Immediate)",
  "detected_symptoms": {
    "critical_flags": ["chest pain", "shortness of breath"],
    "moderate_flags": [],
    "mild_flags": []
  },
  "recommended_action": "Proceed immediately to the nearest Emergency Department or call 112/911.",
  "recommended_specialist": "Emergency Medicine Physician / Trauma Specialist",
  "vitals_to_check": ["Body Temperature", "Blood Pressure", "SpO2", "Pulse Rate"]
}
```

---

## Agent 4 — Drug Safety Agent (RxNav)

**File:** [`backend/app/agents/drug_agent.py`](../backend/app/agents/drug_agent.py)

### What it does
A 3-step pharmacology safety checker that detects drug names, validates them against the NIH drug database, and checks for dangerous interactions.

### Step 1 — Drug Name Extraction
Tokenizes the user message, strips stopwords, and extracts candidate drug names:
```
"Can we combine aspirin with warfarin?"
→ stopwords removed: [can, we, combine, with]
→ candidates: ["aspirin", "warfarin"]
```

### Step 2 — Drug Validation via NIH RxNorm API
```
GET https://rxnav.nlm.nih.gov/REST/rxcui.json?name=aspirin
→ Returns RxNorm ID → Confirmed as valid drug
```
Also checks a local fast-path list of common Indian brand names:
```python
GENERIC_EQUIVALENTS = {
    "crocin":    "Paracetamol 500mg/650mg",
    "dolo":      "Paracetamol 650mg",
    "combiflam": "Ibuprofen (400mg) + Paracetamol (325mg)",
    "augmentin": "Amoxicillin (500mg) + Clavulanic Acid (125mg)",
    "pantocid":  "Pantoprazole 40mg",
    "glycomet":  "Metformin 500mg/850mg/1000mg",
    "ecosprin":  "Aspirin (Acetylsalicylic Acid) 75mg/150mg",
}
```

### Step 3 — Interaction Check
Checks detected drugs against a curated interaction table:

| Drug Pair | Severity | Effect |
|---|---|---|
| aspirin + warfarin | 🔴 High / Major | Severe internal bleeding & hemorrhage |
| ibuprofen + warfarin | 🔴 High / Major | NSAID amplifies anticoagulant → bleeding |
| sildenafil + nitroglycerin | 💀 Critical / Contraindicated | Fatal hypotension |
| metformin + alcohol | 🟠 Moderate-High | Lactic acidosis + hypoglycemia |
| atorvastatin + clarithromycin | 🔴 High | CYP3A4 inhibition → muscle toxicity |
| ciprofloxacin + antacid | 🟡 Moderate | Antacid blocks antibiotic absorption |

### Output
```json
{
  "detected_medications": ["aspirin", "warfarin"],
  "interactions_count": 1,
  "interactions": [{
    "drugs": ["aspirin", "warfarin"],
    "severity": "High / Major Risk",
    "effect": "Severe risk of major internal bleeding and hemorrhage.",
    "recommended_action": "Avoid unless under hematologist monitoring with INR tracking."
  }],
  "safe_to_combine": false
}
```

---

## Agent 5 — AI Council (Verification Agent)

**File:** [`backend/app/agents/verification_agent.py`](../backend/app/agents/verification_agent.py)

### What it does
Acts as an **audit panel** that cross-checks findings from the Triage Agent and Drug Safety Agent for logical consistency. It catches contradictions before the final answer is generated.

### Discrepancy Detection Logic
```python
# Case 1: Critical symptoms found but not flagged as emergency
if critical_flags > 0 AND triage_level != "EMERGENCY_CARE":
    → Add discrepancy: "Critical symptoms detected but triage downgraded"

# Case 2: Drug hazard exists but triage says patient can self-treat at home
if drug_interactions > 0 AND triage_level == "HOME_CARE":
    → Add discrepancy: "Drug interaction hazard present — needs medical supervision"
```

### Confidence Scoring

| Situation | Consensus Score |
|---|---|
| All agents agree, no discrepancies | **96%** |
| Discrepancy found, adjustment needed | **68%** |

### Output
```json
{
  "council_status": "CONSENSUS_REACHED",
  "consensus_confidence_score": 96,
  "agents_participating": [
    "Primary Clinical Triage Agent",
    "Pharmacology & RxNav Agent",
    "Evidence Grounding & Verification Council"
  ],
  "audit_findings": {
    "evidence_grounded": true,
    "discrepancies": [],
    "safety_protocol_adherence": "Compliant with Standard Clinical Guidelines"
  },
  "council_verdict": "All participating AI agents agree on clinical severity and next steps."
}
```

---

## Final Step — Groq LLM Synthesis

**File:** [`backend/app/services/llm_service.py`](../backend/app/services/llm_service.py)

### What it does
After all agents finish, their combined outputs are bundled into a single structured prompt and sent to a large language model for final synthesis into human-readable clinical guidance.

### LLM Model Priority (Failover Chain)
```
1st attempt → Groq API (qwen/qwen3.8-27b)                        [fastest]
2nd attempt → Groq API (openai/gpt-oss-120b)
3rd attempt → Groq API (groq/compound-mini)
4th attempt → OpenRouter (meta-llama/llama-3.3-70b-instruct)
5th attempt → OpenRouter (qwen/qwen-2.5-72b-instruct)
Final fallback → Code-assembled structured response (no LLM needed)
```

### System Prompt Rules for LLM
- Be **short and to the point** (under 120–150 words)
- Answer the specific query in the **very first sentence**
- For emergencies → immediately say "call 112/108, go to ER"
- For drug questions → state what the drug is, Indian brands, when to take, max dosage
- For symptoms → likely condition + 2–3 relief steps + Indian OTC names (Dolo 650, Electral ORS, Pan-40)
- **Never** produce corporate filler or robotic meta-talk

### Context Bundled into the LLM Prompt
```
Patient Query:           <original message>
Triage Data:             <urgency level, symptoms, specialist>
Drug Safety:             <detected drugs, interactions>
Vaccination Data:        <if applicable>
Outbreak Data:           <if applicable>
AI Council Verification: <consensus score, discrepancies>
```

---

## Worked Example

**Query:** _"Patient presents with acute chest pain and shortness of breath. Can we combine aspirin with warfarin?"_

| Step | Agent | Action | Result |
|---|---|---|---|
| 1 | Safety Gate | Detects "chest pain" + "shortness of breath" | Sets intent = `EMERGENCY_TRIAGE` |
| 2 | Intent Classifier | Detects "aspirin" + "warfarin" | Also activates `DRUG_SAFETY` path |
| 3 | Triage Agent | Red flags found: chest pain | `EMERGENCY_CARE` 🔴 |
| 4 | Drug Agent | aspirin + warfarin → NIH RxNav confirmed | Interaction found: Major bleeding risk |
| 5 | AI Council | Triage = EMERGENCY, Drug = Dangerous → both agree | Consensus: **96%** |
| 6 | Groq LLM | Synthesizes all findings | "Call 112/108 immediately. DO NOT combine aspirin + warfarin — major internal bleeding risk." |

---

## Specialist Agents (Full Pipeline Reference)

| Agent | File | Activated When |
|---|---|---|
| Triage Agent | `triage_agent.py` | Symptom queries, emergencies |
| Drug Safety Agent | `drug_agent.py` | Drug / medicine / interaction queries |
| Vaccination Agent | `vaccination_agent.py` | Vaccine / UIP / child immunization queries |
| Preventive Health Agent | `preventive_health_agent.py` | ORS, nutrition, hygiene, POSHAN queries |
| Outbreak Agent | `outbreak_agent.py` | Dengue, cholera, disease surveillance |
| Mental Health Agent | `mental_health_agent.py` | Stress, anxiety, depression, menstrual |
| Medical Scan Agent | `scan_agent.py` | X-ray, MRI, OCR of prescriptions |
| Digital Twin Engine | `ml/digital_twin.py` | Organ health score / 3D twin requests |
| AI Council | `verification_agent.py` | Always runs last to audit all other agents |

---

## Shared State Object

All agents share and mutate a single `SynapseOSState` object flowing through the pipeline:

```python
class SynapseOSState:
    session_id: str
    user_id: str
    channel: str              # "web" | "whatsapp" | "sms"
    input_text: str           # original user message
    detected_intent: str      # set by Intent Classifier
    safety_cleared: bool      # set by Safety Gate
    triage_data: dict         # set by Triage Agent
    drug_check: dict          # set by Drug Agent
    vaccination_data: dict    # set by Vaccination Agent
    outbreak_data: dict       # set by Outbreak Agent
    scan_analysis: dict       # set by Scan Agent
    verification: dict        # set by AI Council
    digital_twin: dict        # set by Digital Twin
    final_response: str       # set by Groq Synthesis
    trace: List[AgentTraceStep]  # latency log for each agent (shown in UI)
    suggested_actions: list   # 4 follow-up actions shown in UI
```

Each agent reads from this state, adds its findings, and passes it forward. No agent overwrites another agent's data.

---

## Key Design Principles

1. **Safety is deterministic, not probabilistic.** The Safety Gate never uses AI — only regex. An AI model cannot override it.
2. **Agents are additive.** Each agent appends to the shared state; none delete or overwrite prior findings.
3. **The pipeline never fully fails.** If all LLMs are unreachable, structured code-assembled fallback responses ensure users always get a reply.
4. **Intent routing is explicit.** Different query types activate different agent combinations — not every agent runs for every query.
5. **Latency is transparent.** Every agent records `duration_ms`, visible as cards in the Swarm Intelligence UI.
6. **India-first.** Drug names include Indian brands (Dolo, Crocin, Electral). Emergency numbers default to India (108/112). Crisis helplines default to Tele-MANAS and KIRAN.
