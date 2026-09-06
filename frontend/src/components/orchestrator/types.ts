export interface AgentTraceStep {
  agent_name: string;
  action: string;
  duration_ms: number;
  details?: Record<string, any>;
}

export interface SynapseOSState {
  session_id: string;
  user_id: string;
  channel: string;
  input_text: string;
  safety_cleared?: boolean;
  safety_message?: string;
  detected_intent?: string;
  triage_data?: {
    urgency_badge?: string;
    triage_level?: string;
    clinical_rationale?: string;
    specialist?: string;
    recommended_action?: string;
    recommended_specialist?: string;
    actionable_steps?: string[];
    [key: string]: any;
  };
  vaccination_data?: Record<string, any>;
  preventive_data?: Record<string, any>;
  outbreak_data?: Record<string, any>;
  logistics?: Record<string, any>;
  triage_result?: {
    urgency: 'EMERGENCY' | 'DOCTOR_CONSULT' | 'HOME_CARE';
    primary_condition: string;
    clinical_summary: string;
    actionable_advice: string[];
    risk_factors: string[];
  };
  drug_check?: {
    detected_medications?: string[];
    interactions_count?: number;
    interactions?: Array<{
      drug_a?: string;
      drug_b?: string;
      drug1?: string;
      drug2?: string;
      severity?: string;
      effect?: string;
      recommended_action?: string;
      [key: string]: any;
    }>;
    [key: string]: any;
  };
  drug_safety_result?: {
    safe_to_combine: boolean;
    high_risk_interactions: Array<{
      drug1: string;
      drug2: string;
      severity: string;
      description: string;
    }>;
    recommendation: string;
  };
  scan_analysis?: {
    ai_diagnosis_summary?: string;
    plain_english_explanation?: string;
    urgency_badge?: string;
    clinical_findings?: string[];
  };
  scan_result?: {
    lesion_detected: boolean;
    lesion_confidence: number;
    findings: string;
    recommendation: string;
    modality: string;
  };
  verification?: {
    consensus_confidence_score?: number;
    consensus_score?: number;
    council_verdict?: string;
    clinical_rationale?: string;
    safety_audit_passed?: boolean;
    evidence_grounding?: string[]; agent_votes?: Array<{ agent: string; score: number; status: string }>;
  };
  digital_twin?: {
    overall_health_score: number;
    organ_scores: Record<string, number>;
  };
  suggested_actions?: string[];
  final_response?: string;
  trace: AgentTraceStep[];
}

export interface PatientInfo {
  name: string;
  abhaId: string;
  dob: string;
  gender: string;
  bloodType: string;
  policyNumber: string;
  planType: string;
  residence: string;
  avatarUrl: string;
}

export interface VitalsData {
  heartRate: number;
  maxHeartRate: number;
  avgHeartRate: number;
  systolicBp: number;
  diastolicBp: number;
  oxygenSaturation: number;
  respirationRate: number;
  glucoseLevel?: number;
  temperature?: number;
}

export interface DetectedCondition {
  id: string;
  title: string;
  doctor: string;
  specialty?: string;
  painLevel?: number; // 0 - 20
  exerciseVideoUrl?: string;
  xrayImages?: string[];
  angleCurrent?: number;
  angleNormal?: number;
  notes?: string;
  status: 'Critical' | 'Monitoring' | 'Stable';
  organ: 'heart' | 'lungs' | 'knee' | 'shoulder' | 'brain' | 'liver';
  lastUpdated?: string;
  metrics?: Record<string, string | number>;
}

export interface DoctorSlot {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  experienceYears: number;
  rating: number;
  availableSlot: string;
  consultationFee: string;
  schemeEmpanelled: boolean;
  avatarUrl?: string;
}

export interface RiskMatrixCell {
  impact: 'Extensive' | 'Major' | 'Medium' | 'Minor' | 'No Impact';
  probability: 'Highly Unlikely' | 'Unlikely' | 'Possible' | 'Likely' | 'Very Likely';
  level: 'High' | 'Medium' | 'Low';
  label: string;
  count: number;
}

export interface HospitalMetrics {
  totalAdmitted: number;
  malePatients: number;
  femalePatients: number;
  waiting: number;
  discharge: number;
  transfer: number;
  activeStaff: number;
  doctors: number;
  nursing: number;
  operationalCost: string;
  avgCostPerPatient: string;
  patientSatisfactionRate: number;
  satisfactionBreakdown: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
  criticalPatients: {
    active: number;
    recovered: number;
    ventilatorsInUse: number;
    ventilatorsTotal: number;
  };
  bedOccupancy: {
    occupied: number;
    total: number;
    categories: Array<{ label: string; count: number; color: string }>;
  };
  admittedList: Array<{
    name: string;
    age: number;
    gender: 'M' | 'F';
    id: string;
    room: string;
    doctor: string;
    nurse: string;
    division: string;
    critical: boolean;
  }>;
}
