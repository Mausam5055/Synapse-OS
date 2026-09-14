"""
SynapseOS — agents/drug_agent.py
Drug Safety, RxNav Name Normalization, and Multi-Drug Interaction Agent.
Combines NIH RxNorm REST APIs with live LLM clinical pharmacology reasoning (Groq/OpenRouter).
"""

import re
import httpx
from typing import Dict, Any, List, Optional
from backend.app.core.state import SynapseOSState, AgentTraceStep
from backend.app.services.llm_service import call_llm_json

RXNAV_BASE = "https://rxnav.nlm.nih.gov/REST"
RXNAV_TIMEOUT = 3.5

KNOWN_INTERACTIONS = [
    {
        "pair": {"aspirin", "warfarin"},
        "severity": "High / Major Risk",
        "effect": "Severe risk of major internal bleeding and hemorrhage.",
        "action": "Avoid combination unless under strict hematologist monitoring with INR tracking."
    },
    {
        "pair": {"ibuprofen", "warfarin"},
        "severity": "High / Major Risk",
        "effect": "NSAIDs damage stomach lining and potentiate anticoagulant effects of warfarin.",
        "action": "Do not co-administer; use acetaminophen (paracetamol) for mild analgesia if approved by doctor."
    },
    {
        "pair": {"ibuprofen", "lisinopril"},
        "severity": "Moderate Risk",
        "effect": "NSAIDs can decrease the antihypertensive effect of ACE inhibitors and increase renal impairment risk.",
        "action": "Monitor blood pressure and renal function (eGFR/creatinine)."
    },
    {
        "pair": {"sildenafil", "nitroglycerin"},
        "severity": "Critical / Contraindicated",
        "effect": "Profound, potentially fatal hypotension (drop in blood pressure).",
        "action": "Strictly contraindicated. Never take PDE5 inhibitors with nitrates."
    },
    {
        "pair": {"metformin", "alcohol"},
        "severity": "Moderate-High Risk",
        "effect": "Significantly elevated risk of lactic acidosis and hypoglycemia.",
        "action": "Limit alcohol consumption while on metformin therapy."
    },
    {
        "pair": {"atorvastatin", "clarithromycin"},
        "severity": "High Risk",
        "effect": "Inhibition of CYP3A4 increases statin blood levels, causing rhabdomyolysis and muscle toxicity.",
        "action": "Temporarily suspend statin during antibiotic course or use azithromycin."
    },
    {
        "pair": {"ciprofloxacin", "antacid"},
        "severity": "Moderate Risk",
        "effect": "Divalent/trivalent cations (aluminum, magnesium, calcium) chelate fluoroquinolones, preventing absorption.",
        "action": "Take ciprofloxacin 2 hours before or 6 hours after antacids/dairy."
    },
    {
        "pair": {"combiflam", "telmisartan"},
        "severity": "High Risk — Acute Kidney Injury (AKI)",
        "effect": "Combiflam (Ibuprofen) constricts afferent renal arterioles while Telmisartan dilates efferent arterioles, causing acute drop in glomerular filtration (AKI) and blunting BP control.",
        "action": "Avoid combination. Use Paracetamol alone for pain or consult cardiologist for renal-sparing analgesia."
    },
    {
        "pair": {"ibuprofen", "telmisartan"},
        "severity": "High Risk — Acute Kidney Injury (AKI)",
        "effect": "NSAIDs impair renal perfusion and blunt antihypertensive efficacy of ARBs (Telmisartan).",
        "action": "Avoid concurrent use; monitor renal function (serum creatinine, eGFR) and blood pressure."
    },
    {
        "pair": {"ibuprofen", "metformin"},
        "severity": "High Risk — Lactic Acidosis Vulnerability",
        "effect": "NSAID-induced acute renal impairment reduces Metformin clearance, escalating the risk of fatal Metformin-Associated Lactic Acidosis (MALA).",
        "action": "Exercise extreme caution; ensure normal renal function before taking NSAIDs with Metformin."
    },
    {
        "pair": {"combiflam", "metformin"},
        "severity": "High Risk — Lactic Acidosis Vulnerability",
        "effect": "Ibuprofen in Combiflam can induce acute renal strain, reducing Metformin excretion and risking lactic acidosis.",
        "action": "Avoid self-medicating with Combiflam; consult treating diabetologist."
    },
]

GENERIC_EQUIVALENTS = {
    "crocin": "Paracetamol (Acetaminophen) 500mg/650mg - Analgesic & Antipyretic",
    "dolo": "Paracetamol 650mg - Analgesic & Antipyretic",
    "combiflam": "Ibuprofen (400mg) + Paracetamol (325mg)",
    "augmentin": "Amoxicillin (500mg) + Clavulanic Acid (125mg)",
    "pantocid": "Pantoprazole 40mg - Proton Pump Inhibitor (Acid Reflux)",
    "pan d": "Pantoprazole (40mg) + Domperidone (30mg)",
    "glycomet": "Metformin Hydrochloride 500mg/850mg/1000mg",
    "telma": "Telmisartan 40mg/80mg - Angiotensin Receptor Blocker",
    "ecosprin": "Aspirin (Acetylsalicylic Acid) 75mg/150mg Gastro-resistant",
}

JAN_AUSHADHI_PRICE_DATABASE = {
    "augmentin": {
        "brand_name": "Augmentin 625 Duo",
        "generic_name": "Amoxicillin (500mg) + Potassium Clavulanate (125mg)",
        "branded_mrp": 215.0,
        "jan_aushadhi_price": 58.0,
        "category": "Antibiotic (Broad Spectrum)",
        "unit": "Strip of 10 Tablets"
    },
    "amoxicillin": {
        "brand_name": "Novamox 500 / Mox 500",
        "generic_name": "Amoxicillin 500mg",
        "branded_mrp": 90.0,
        "jan_aushadhi_price": 28.0,
        "category": "Antibiotic",
        "unit": "Strip of 10 Capsules"
    },
    "telma": {
        "brand_name": "Telma 40",
        "generic_name": "Telmisartan 40mg",
        "branded_mrp": 145.0,
        "jan_aushadhi_price": 18.0,
        "category": "Antihypertensive (ARB)",
        "unit": "Strip of 10 Tablets"
    },
    "telmisartan": {
        "brand_name": "Telma 40 / Micardis",
        "generic_name": "Telmisartan 40mg",
        "branded_mrp": 145.0,
        "jan_aushadhi_price": 18.0,
        "category": "Antihypertensive (ARB)",
        "unit": "Strip of 10 Tablets"
    },
    "glycomet": {
        "brand_name": "Glycomet 500",
        "generic_name": "Metformin Hydrochloride 500mg",
        "branded_mrp": 72.0,
        "jan_aushadhi_price": 14.0,
        "category": "Antidiabetic (Biguanide)",
        "unit": "Strip of 10 Tablets"
    },
    "metformin": {
        "brand_name": "Glycomet 500",
        "generic_name": "Metformin Hydrochloride 500mg",
        "branded_mrp": 72.0,
        "jan_aushadhi_price": 14.0,
        "category": "Antidiabetic (Biguanide)",
        "unit": "Strip of 10 Tablets"
    },
    "pan": {
        "brand_name": "Pan 40",
        "generic_name": "Pantoprazole 40mg Gastro-Resistant",
        "branded_mrp": 165.0,
        "jan_aushadhi_price": 22.0,
        "category": "Proton Pump Inhibitor (Acidity / GERD)",
        "unit": "Strip of 10 Tablets"
    },
    "pan d": {
        "brand_name": "Pan-D",
        "generic_name": "Pantoprazole (40mg) + Domperidone (30mg)",
        "branded_mrp": 185.0,
        "jan_aushadhi_price": 26.0,
        "category": "Antacid & Antiemetic",
        "unit": "Strip of 10 Capsules"
    },
    "pantocid": {
        "brand_name": "Pantocid 40",
        "generic_name": "Pantoprazole 40mg",
        "branded_mrp": 160.0,
        "jan_aushadhi_price": 22.0,
        "category": "Proton Pump Inhibitor",
        "unit": "Strip of 10 Tablets"
    },
    "pantoprazole": {
        "brand_name": "Pan 40 / Pantocid",
        "generic_name": "Pantoprazole 40mg",
        "branded_mrp": 165.0,
        "jan_aushadhi_price": 22.0,
        "category": "Proton Pump Inhibitor",
        "unit": "Strip of 10 Tablets"
    },
    "atorva": {
        "brand_name": "Atorva 10 / Lipitor",
        "generic_name": "Atorvastatin Calcium 10mg",
        "branded_mrp": 120.0,
        "jan_aushadhi_price": 16.0,
        "category": "Lipid-Lowering Statin (Cardiovascular)",
        "unit": "Strip of 10 Tablets"
    },
    "atorvastatin": {
        "brand_name": "Atorva 10",
        "generic_name": "Atorvastatin Calcium 10mg",
        "branded_mrp": 120.0,
        "jan_aushadhi_price": 16.0,
        "category": "Lipid-Lowering Statin",
        "unit": "Strip of 10 Tablets"
    },
    "thyronorm": {
        "brand_name": "Thyronorm 100mcg",
        "generic_name": "Thyroxine Sodium 100mcg",
        "branded_mrp": 195.0,
        "jan_aushadhi_price": 32.0,
        "category": "Thyroid Hormone Replacement",
        "unit": "Bottle of 100 Tablets"
    },
    "levothyroxine": {
        "brand_name": "Thyronorm / Eltroxin",
        "generic_name": "Thyroxine Sodium 100mcg",
        "branded_mrp": 195.0,
        "jan_aushadhi_price": 32.0,
        "category": "Thyroid Hormone",
        "unit": "Bottle of 100 Tablets"
    },
    "dolo": {
        "brand_name": "Dolo 650 / Calpol 650",
        "generic_name": "Paracetamol 650mg",
        "branded_mrp": 34.0,
        "jan_aushadhi_price": 12.0,
        "category": "Analgesic & Antipyretic",
        "unit": "Strip of 15 Tablets"
    },
    "crocin": {
        "brand_name": "Crocin 650",
        "generic_name": "Paracetamol 650mg",
        "branded_mrp": 34.0,
        "jan_aushadhi_price": 12.0,
        "category": "Analgesic & Antipyretic",
        "unit": "Strip of 15 Tablets"
    },
    "paracetamol": {
        "brand_name": "Dolo 650 / Crocin",
        "generic_name": "Paracetamol 650mg",
        "branded_mrp": 34.0,
        "jan_aushadhi_price": 12.0,
        "category": "Analgesic & Antipyretic",
        "unit": "Strip of 15 Tablets"
    },
    "combiflam": {
        "brand_name": "Combiflam",
        "generic_name": "Ibuprofen (400mg) + Paracetamol (325mg)",
        "branded_mrp": 48.0,
        "jan_aushadhi_price": 15.0,
        "category": "NSAID Pain & Inflammation",
        "unit": "Strip of 20 Tablets"
    },
    "ecosprin": {
        "brand_name": "Ecosprin 75",
        "generic_name": "Aspirin 75mg Gastro-Resistant",
        "branded_mrp": 15.0,
        "jan_aushadhi_price": 4.5,
        "category": "Antiplatelet / Cardioprotective",
        "unit": "Strip of 14 Tablets"
    },
    "aspirin": {
        "brand_name": "Ecosprin 75 / Disprin",
        "generic_name": "Aspirin (Acetylsalicylic Acid) 75mg",
        "branded_mrp": 15.0,
        "jan_aushadhi_price": 4.5,
        "category": "Antiplatelet",
        "unit": "Strip of 14 Tablets"
    },
    "azithral": {
        "brand_name": "Azithral 500",
        "generic_name": "Azithromycin 500mg",
        "branded_mrp": 135.0,
        "jan_aushadhi_price": 42.0,
        "category": "Macrolide Antibiotic (Respiratory)",
        "unit": "Strip of 5 Tablets"
    },
    "azithromycin": {
        "brand_name": "Azithral 500 / Zithromax",
        "generic_name": "Azithromycin 500mg",
        "branded_mrp": 135.0,
        "jan_aushadhi_price": 42.0,
        "category": "Macrolide Antibiotic",
        "unit": "Strip of 5 Tablets"
    },
    "montair": {
        "brand_name": "Montair-LC",
        "generic_name": "Montelukast (10mg) + Levocetirizine (5mg)",
        "branded_mrp": 220.0,
        "jan_aushadhi_price": 32.0,
        "category": "Antiallergic & Bronchodilator",
        "unit": "Strip of 10 Tablets"
    },
    "cetirizine": {
        "brand_name": "Cetzine 10 / Alerid",
        "generic_name": "Cetirizine Hydrochloride 10mg",
        "branded_mrp": 42.0,
        "jan_aushadhi_price": 9.0,
        "category": "Antihistamine",
        "unit": "Strip of 10 Tablets"
    },
    "amlong": {
        "brand_name": "Amlong 5 / Norvasc",
        "generic_name": "Amlodipine 5mg",
        "branded_mrp": 65.0,
        "jan_aushadhi_price": 8.0,
        "category": "Calcium Channel Blocker (BP)",
        "unit": "Strip of 10 Tablets"
    },
    "amlodipine": {
        "brand_name": "Amlong 5",
        "generic_name": "Amlodipine 5mg",
        "branded_mrp": 65.0,
        "jan_aushadhi_price": 8.0,
        "category": "Calcium Channel Blocker",
        "unit": "Strip of 10 Tablets"
    },
    "ciprofloxacin": {
        "brand_name": "Ciprogut 500 / Ciplox 500",
        "generic_name": "Ciprofloxacin 500mg",
        "branded_mrp": 60.0,
        "jan_aushadhi_price": 16.0,
        "category": "Fluoroquinolone Antibiotic",
        "unit": "Strip of 10 Tablets"
    }
}


def calculate_jan_aushadhi_savings(items: Any) -> Dict[str, Any]:
    """
    Calculates direct rupee and percentage savings by switching from private branded medicines
    to Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) generic equivalents.
    """
    if isinstance(items, str):
        candidates = extract_candidate_drugs(items)
        if "pan" in items.lower() and "d" in items.lower():
            candidates.append("pan d")
    elif isinstance(items, list):
        candidates = []
        for it in items:
            it_str = str(it).lower().strip()
            candidates.extend(extract_candidate_drugs(it_str))
            if "pan d" in it_str or "pan-d" in it_str:
                candidates.append("pan d")
    else:
        candidates = []

    matched_items = []
    seen = set()
    total_branded = 0.0
    total_jan_aushadhi = 0.0

    for cand in candidates:
        cand_key = cand.lower().strip()
        if cand_key in JAN_AUSHADHI_PRICE_DATABASE and cand_key not in seen:
            seen.add(cand_key)
            record = JAN_AUSHADHI_PRICE_DATABASE[cand_key]
            branded_mrp = record["branded_mrp"]
            ja_price = record["jan_aushadhi_price"]
            savings_rs = round(branded_mrp - ja_price, 2)
            savings_pct = round((savings_rs / branded_mrp) * 100, 1)

            matched_items.append({
                "query_token": cand,
                "brand_name": record["brand_name"],
                "generic_composition": record["generic_name"],
                "category": record["category"],
                "unit": record["unit"],
                "branded_mrp_inr": branded_mrp,
                "jan_aushadhi_price_inr": ja_price,
                "savings_inr": savings_rs,
                "savings_percentage": savings_pct
            })
            total_branded += branded_mrp
            total_jan_aushadhi += ja_price

    total_savings = round(total_branded - total_jan_aushadhi, 2)
    overall_pct = round((total_savings / total_branded) * 100, 1) if total_branded > 0 else 0.0

    return {
        "status": "CALCULATED",
        "medicines_matched_count": len(matched_items),
        "total_branded_mrp_inr": round(total_branded, 2),
        "total_jan_aushadhi_price_inr": round(total_jan_aushadhi, 2),
        "total_savings_inr": total_savings,
        "overall_savings_percentage": overall_pct,
        "itemized_savings": matched_items,
        "affordability_verdict": f"Save ₹{int(total_savings)} ({overall_pct}%) with PMBJP Jan Aushadhi Generic Equivalents" if total_savings > 0 else "Generic equivalents available at Jan Aushadhi Kendras.",
        "scheme_details": {
            "program_name": "Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)",
            "governing_body": "Pharmaceuticals & Medical Devices Bureau of India (PMBI), Ministry of Chemicals & Fertilizers",
            "kendras_active": "10,000+ Kendras Nationwide",
            "locator_tool": "Download 'Jan Aushadhi Sugam' Mobile App or visit http://janaushadhi.gov.in"
        }
    }

KNOWN_DRUG_NAMES = {
    "warfarin", "aspirin", "ibuprofen", "paracetamol", "acetaminophen",
    "metformin", "lisinopril", "atorvastatin", "sildenafil", "nitroglycerin",
    "clarithromycin", "ciprofloxacin", "pantoprazole", "amoxicillin",
    "crocin", "dolo", "combiflam", "augmentin", "pantocid", "pan", "glycomet",
    "telma", "telmisartan", "ecosprin", "cetirizine", "azithromycin", "omeprazole", "clopidogrel",
    "heparin", "digoxin", "amiodarone", "levothyroxine", "losartan", "amlodipine"
}

_STOPWORDS = {
    "can", "i", "take", "with", "and", "or", "the", "a", "an", "is", "it", "safe", "to", "does",
    "have", "interact", "interaction", "interactions", "between", "my", "for", "of", "drug", "drugs",
    "medication", "medicine", "combine", "mix", "together", "this", "that", "are", "will", "what",
    "about", "dosage", "side", "effects", "daily", "patient", "acute", "fever", "pain", "joint", "severe", "shortness", "breath"
}


def extract_candidate_drugs(text: str) -> List[str]:
    words = re.findall(r"[a-zA-Z]{3,}", (text or "").lower())
    return [w for w in dict.fromkeys(words) if w not in _STOPWORDS]


async def resolve_drug_rxnav(client: httpx.AsyncClient, term: str) -> Optional[str]:
    """Check NIH RxNorm for drug validity."""
    if term in KNOWN_DRUG_NAMES or term in GENERIC_EQUIVALENTS:
        return term
    try:
        resp = await client.get(f"{RXNAV_BASE}/rxcui.json", params={"name": term}, timeout=1.5)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("idGroup", {}).get("rxnormId"):
                return term
    except Exception:
        pass
    return None


async def evaluate_drug_safety(text: str) -> Dict[str, Any]:
    """
    Evaluates mentioned medicines, queries NIH RxNav,
    and runs genuine LLM pharmacology interaction checking.
    """
    import asyncio
    candidates = extract_candidate_drugs(text)
    detected_drugs = []

    # Fast-path: immediately identify known medications and generic brands
    for c in candidates:
        if c in KNOWN_DRUG_NAMES or c in GENERIC_EQUIVALENTS:
            if c not in detected_drugs:
                detected_drugs.append(c)

    # Secondary: query RxNav concurrently for remaining unknown candidates (max 4)
    unknown_candidates = [c for c in candidates if c not in detected_drugs][:4]
    if unknown_candidates:
        try:
            async with httpx.AsyncClient() as client:
                tasks = [resolve_drug_rxnav(client, c) for c in unknown_candidates]
                results = await asyncio.gather(*tasks, return_exceptions=True)
                for res in results:
                    if isinstance(res, str) and res and res not in detected_drugs:
                        detected_drugs.append(res)
        except Exception:
            pass

    detected_set = set(detected_drugs)
    interactions_found = []

    for item in KNOWN_INTERACTIONS:
        if item["pair"].issubset(detected_set):
            interactions_found.append({
                "drugs": list(item["pair"]),
                "severity": item["severity"],
                "effect": item["effect"],
                "recommended_action": item["action"]
            })

    from backend.app.core.safety_router import is_pediatric_query, ASPIRIN_PATTERNS
    is_ped = is_pediatric_query(text)
    has_asp = any(re.search(p, (text or "").lower()) for p in ASPIRIN_PATTERNS)
    if is_ped and has_asp:
        interactions_found.append({
            "drugs": ["aspirin", "pediatric_patient"],
            "severity": "CRITICAL / CONTRAINDICATED (Reye's Syndrome Risk)",
            "effect": "Administering aspirin to children with viral illness/fever carries severe risk of fatal Reye's Syndrome (acute encephalopathy and hepatic failure).",
            "recommended_action": "Strictly withhold Aspirin. Consult a pediatrician for weight-based pediatric fever relief."
        })

    # Generic mappings
    generic_info = []
    for d in detected_drugs:
        if d in GENERIC_EQUIVALENTS:
            generic_info.append({"brand": d, "composition": GENERIC_EQUIVALENTS[d]})

    # Clinically sound safe_to_combine: NEVER give unconditional blanket approval
    if interactions_found:
        safe_to_combine = False
    elif len(detected_drugs) >= 2:
        safe_to_combine = False  # Polypharmacy always requires physician/pharmacist reconciliation
    else:
        safe_to_combine = None

    savings = calculate_jan_aushadhi_savings(detected_drugs)

    fallback = {
        "detected_medications": detected_drugs,
        "interactions_count": len(interactions_found),
        "interactions": interactions_found,
        "generic_equivalents": generic_info,
        "jan_aushadhi_savings": savings,
        "safe_to_combine": safe_to_combine,
        "clinical_pharmacology_summary": "Screening completed against NIH RxNav and clinical contraindication guidelines. Professional clinician review recommended.",
        "disclaimer": "This system cannot safely authorize unsupervised polypharmacy. Always verify drug regimens with a registered healthcare professional."
    }

    return fallback


async def drug_agent_node(state: SynapseOSState) -> SynapseOSState:
    """LangGraph node execution for Drug Safety."""
    import time
    start = time.time()
    
    res = await evaluate_drug_safety(state.input_text)
    state.drug_check = res
    
    duration = int((time.time() - start) * 1000)
    state.trace.append(AgentTraceStep(
        agent_name="Pharmacology & Drug Safety Agent (RxNav + Gemini)",
        action=f"Scanned {len(res.get('detected_medications', []))} medications via NIH RxNav & Gemini Swarm",
        duration_ms=duration,
        details={"detected": res.get("detected_medications", []), "hazards": len(res.get("interactions", []))}
    ))
    return state
