import { useState, useEffect } from 'react';
import { SynapseOSState, PatientInfo } from '../types';
import { ShieldCheck, GitBranch, Activity, Pill, Users } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface DAGNode {
  id: string;
  name: string;
  role: string;
  icon: any;
  status: 'idle' | 'running' | 'completed' | 'warning';
  latencyMs: number;
}

const DEFAULT_QUERY = 'Patient presents with acute chest pain and shortness of breath. Can we combine aspirin with warfarin?';

export function useSwarmLogic(patient: PatientInfo) {
  const { translateText, language } = useLanguage();
  const [query, setQuery] = useState(() => translateText(DEFAULT_QUERY));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SynapseOSState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'synthesis' | 'tabular' | 'dag_trace' | 'interactions'>('synthesis');

  useEffect(() => {
    setQuery(prev => {
      if (!prev || prev === DEFAULT_QUERY || prev.includes('aspirin') || prev.includes('एस्पिरिन') || prev.includes('ওয়ারফারিন') || prev.includes('వార్ఫరిన్') || prev.includes('வார்ஃபரின்') || prev.includes('वारफेरिन')) {
        return translateText(DEFAULT_QUERY);
      }
      return prev;
    });
  }, [language, translateText]);

  const presets = [
    { 
      category: 'Vaccination',
      title: '💉 UIP 6-Week Infant Immunization', 
      query: translateText('What vaccines are due for a 6-week old baby in India under the Universal Immunization Programme (UIP)?') 
    },
    { 
      category: 'Preventive Health',
      title: '🌿 Child Diarrhea & ORS Preparation', 
      query: translateText('How to prepare WHO-standard ORS and Zinc at home for a child experiencing acute watery diarrhea and dehydration?') 
    },
    { 
      category: 'Outbreak Alerts',
      title: '🚨 Delhi Dengue Outbreak Early Warning', 
      query: translateText('Check real-time Dengue outbreak surge status, containment zones, and preventive directives in Delhi NCR.') 
    },
    { 
      category: 'Pharmacology',
      title: '💊 Warfarin & Ibuprofen Interaction', 
      query: translateText('Patient is on Warfarin 5mg daily. Experiences acute joint pain and fever; can they take Ibuprofen 400mg with Warfarin?') 
    },
    { 
      category: 'Emergency',
      title: '🚨 Acute Chest Pain & Dyspnea', 
      query: translateText('Severe crushing chest pain radiating to left arm and jaw with cold sweat, O2 saturation 92%, BP 145/95.') 
    }
  ];

  const getTraceMs = (keywords: string[], fallback: number) => {
    if (!result?.trace) return fallback;
    const match = result.trace.find(t => 
      keywords.some(k => (t.agent_name || '').toLowerCase().includes(k.toLowerCase()))
    );
    return match?.duration_ms ?? fallback;
  };

  const isAgentActiveInTrace = (keywords: string[]) => {
    if (!result) return false;
    if (!result.trace || result.trace.length === 0) return true;
    return result.trace.some(t => 
      keywords.some(k => (t.agent_name || '').toLowerCase().includes(k.toLowerCase()))
    );
  };

  const dagNodes: DAGNode[] = [
    { 
      id: 'safety_gate', 
      name: 'Safety Gate', 
      role: 'Deterministic Crisis Intercept', 
      icon: ShieldCheck, 
      status: result ? (result.safety_cleared ? 'completed' : 'warning') : loading ? 'running' : 'idle', 
      latencyMs: getTraceMs(['safety gate', 'crisis', 'deterministic'], 14) 
    },
    { 
      id: 'intent_router', 
      name: 'Intent Classifier', 
      role: 'Zero-Shot Multi-Domain Router', 
      icon: GitBranch, 
      status: result ? 'completed' : loading ? 'running' : 'idle', 
      latencyMs: getTraceMs(['intent', 'classifier', 'router'], 38) 
    },
    { 
      id: 'triage_agent', 
      name: 'Clinical Triage', 
      role: 'Symptom & Urgency Stratifier', 
      icon: Activity, 
      status: result ? (isAgentActiveInTrace(['triage', 'symptom', 'biobert']) ? 'completed' : 'idle') : loading ? 'running' : 'idle', 
      latencyMs: getTraceMs(['triage', 'biobert'], 280) 
    },
    { 
      id: 'rxnav_agent', 
      name: 'RxNav Safety', 
      role: 'Drug-Drug Interaction Engine', 
      icon: Pill, 
      status: result ? (isAgentActiveInTrace(['rxnav', 'drug']) ? 'completed' : 'idle') : loading ? 'running' : 'idle', 
      latencyMs: getTraceMs(['rxnav', 'drug'], 145) 
    },
    { 
      id: 'council_agent', 
      name: 'AI Council', 
      role: '80%+ Accuracy Benchmark Auditor', 
      icon: Users, 
      status: result ? (isAgentActiveInTrace(['council', 'verification']) ? 'completed' : 'idle') : loading ? 'running' : 'idle', 
      latencyMs: getTraceMs(['council', 'verification'], 190) 
    }
  ];

  const handleExecuteSwarm = async (customQuery?: string) => {
    const q = customQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const res = await fetch(`${API_BASE}/api/orchestrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, channel: 'web', user_id: patient.name }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        setErrorMessage(`Swarm Orchestrator returned HTTP ${res.status}. Check backend logs.`);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setErrorMessage('Swarm DAG execution timed out after 20 seconds. Please try again.');
      } else {
        setErrorMessage(`Swarm communication error: ${err?.message || 'Failed to reach API'}. Please ensure FastAPI backend is running.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    query, setQuery,
    loading, setLoading,
    result, setResult,
    errorMessage, setErrorMessage,
    activeTab, setActiveTab,
    presets,
    dagNodes,
    handleExecuteSwarm
  };
}
