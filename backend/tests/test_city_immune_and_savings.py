import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.agents.drug_agent import calculate_jan_aushadhi_savings, JAN_AUSHADHI_PRICE_DATABASE
from backend.app.agents.outbreak_agent import get_pincode_outbreak_heatmap, record_community_symptom_signal
from backend.app.services.meta_whatsapp_service import detect_language_script

client = TestClient(app)

def test_jan_aushadhi_savings_calculation():
    """Verify generic price savings calculator returns accurate INR and % difference."""
    res = calculate_jan_aushadhi_savings(["Augmentin 625", "Telma 40", "Pan-D"])
    assert res["status"] == "CALCULATED"
    assert res["medicines_matched_count"] >= 2
    assert res["total_branded_mrp_inr"] > res["total_jan_aushadhi_price_inr"]
    assert res["total_savings_inr"] > 0
    assert res["overall_savings_percentage"] > 50  # Jan Aushadhi typically gives 60-80% discount
    assert any("Amoxicillin" in s["generic_composition"] for s in res["itemized_savings"])

def test_pincode_outbreak_heatmap_known_ward():
    """Verify ward-level micro-surveillance grid for known PIN code."""
    res = get_pincode_outbreak_heatmap(pincode="110005")
    assert res["status"] == "ONLINE_HEATMAP_GRID"
    assert res["total_wards_tracked"] >= 1
    ward = res["wards"][0]
    assert "Karol Bagh" in ward["ward_name"]
    assert ward["city"] == "Delhi"
    assert ward["effective_reproduction_rt"] >= 1.5
    assert ward["active_signals_24h"] > 0

def test_pincode_outbreak_heatmap_fallback():
    """Verify fallback response for unmapped PIN code returns default surveillance grid."""
    res = get_pincode_outbreak_heatmap(pincode="999999")
    assert res["status"] == "ONLINE_HEATMAP_GRID"
    assert res["total_wards_tracked"] > 0
    assert len(res["wards"]) > 0

def test_record_community_symptom_signal():
    """Verify crowdsourced WhatsApp symptom signals update live ward counts."""
    heatmap_before = get_pincode_outbreak_heatmap(pincode="110005")
    initial_signals = heatmap_before["wards"][0]["active_signals_24h"]
    
    updated = record_community_symptom_signal("110005", "acute_febrile", channel="whatsapp")
    assert updated["status"] == "SIGNAL_RECORDED"
    assert updated["updated_active_signals_24h"] == initial_signals + 1
    assert "acute_febrile" in updated["updated_clusters"]

def test_auto_language_script_detection():
    """Verify Unicode script detection maps to correct ISO 639-1 language codes."""
    assert detect_language_script("मुझे तीन दिन से तेज बुखार है") == "hi"
    assert detect_language_script("எனக்கு தலைவலி மற்றும் காய்ச்சல் உள்ளது") == "ta"
    assert detect_language_script("আমার পেটে তীব্র ব্যথা হচ্ছে") == "bn"
    assert detect_language_script("నాకు కడుపు నొప్పిగా ఉంది") == "te"
    assert detect_language_script("I have severe cough and fever") == "en"

def test_api_jan_aushadhi_savings_endpoint():
    """Verify POST /api/drug/jan-aushadhi-savings endpoint."""
    response = client.post(
        "/api/drug/jan-aushadhi-savings",
        json={"medicines": ["Augmentin 625", "Glycomet-GP 2", "Ecosprin 75"]}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "CALCULATED"
    assert data["total_savings_inr"] > 0
    assert data["overall_savings_percentage"] > 0
    assert len(data["itemized_savings"]) >= 2

def test_api_pincode_heatmap_endpoint():
    """Verify GET /api/outbreak/pincode-heatmap endpoint."""
    response = client.get("/api/outbreak/pincode-heatmap?pincode=400050")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ONLINE_HEATMAP_GRID"
    assert data["total_wards_tracked"] >= 1
    assert "Bandra West" in data["wards"][0]["ward_name"]
    assert data["wards"][0]["city"] == "Mumbai"
