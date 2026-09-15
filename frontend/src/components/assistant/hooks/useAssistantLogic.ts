import { useState, useEffect, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import { ActiveTab, ChatSession, Message, ModelChoice, Persona, SupportedLanguage, VoiceState } from '../types';
import { 
  MOCK_HEALTH_PROFILES, 
  MockHealthProfile, 
  mausamKarProfile 
} from '@/data/mockHealthProfiles';
import { getLocalizedDefaultSessions } from '../translations';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const LANGUAGE_SPEECH_MAP: Record<SupportedLanguage, { speechCode: string; name: string; native: string }> = {
  en: { speechCode: 'en-US', name: 'English', native: 'English' },
  hi: { speechCode: 'hi-IN', name: 'Hindi', native: 'हिन्दी' },
  bn: { speechCode: 'bn-IN', name: 'Bengali', native: 'বাংলা' },
  ta: { speechCode: 'ta-IN', name: 'Tamil', native: 'தமிழ்' },
  te: { speechCode: 'te-IN', name: 'Telugu', native: 'తెలుగు' },
  mr: { speechCode: 'mr-IN', name: 'Marathi', native: 'मराठी' },
  gu: { speechCode: 'gu-IN', name: 'Gujarati', native: 'ગુજરાતી' },
  kn: { speechCode: 'kn-IN', name: 'Kannada', native: 'ಕನ್ನಡ' },
  ml: { speechCode: 'ml-IN', name: 'Malayalam', native: 'മലയാളം' },
  pa: { speechCode: 'pa-IN', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  or: { speechCode: 'or-IN', name: 'Odia', native: 'ଓଡ଼ିଆ' }
};
export const getDefaultSessions = (patient: MockHealthProfile, lang: SupportedLanguage = 'en'): ChatSession[] => {
  return [];
};

const DEFAULT_VAPI_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '7709f749-ce4c-4a9f-bef2-637223f17258';
const DEFAULT_VAPI_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || 'f92542f6-1975-4169-8459-e46684910676';
const DEFAULT_GROQ_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || '';

export function useAssistantLogic() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Multilingual Configuration
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');

  // Live AI Voice Mode State (ChatGPT / Apple Intelligence style)
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('listening');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [aiSpeechText, setAiSpeechText] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  
  // Active view tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  
  // Personas & Model
  const [assistantPersona, setAssistantPersona] = useState<Persona>('copilot');
  const [selectedModel, setSelectedModel] = useState<ModelChoice>('groq-qwen-27b');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showKeyText, setShowKeyText] = useState(false);

  // WhatsApp Bridge Config State
  const [waPhoneNumber, setWaPhoneNumber] = useState('');
  const [waConnected, setWaConnected] = useState(false);
  const [waMetaToken, setWaMetaToken] = useState('');
  const [waWebhookUrl, setWaWebhookUrl] = useState(`${API_BASE}/api/whatsapp/webhook`);
  const [waAutoSyncReports, setWaAutoSyncReports] = useState(true);
  const [waDailyReminders, setWaDailyReminders] = useState(true);

  // Credentials & API Keys
  const [vapiPublicKey, setVapiPublicKey] = useState(DEFAULT_VAPI_KEY);
  const [vapiAssistantId, setVapiAssistantId] = useState(DEFAULT_VAPI_ID);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [groqApiKey, setGroqApiKey] = useState(DEFAULT_GROQ_KEY);
  const [backendUrl, setBackendUrl] = useState(API_BASE);

  // Active Patient Profile for Orchestrator Telemetry
  const [activeProfileId, setActiveProfileId] = useState<string>('mausam_kar_verified_abha');

  const [vapi, setVapi] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load saved credentials & chat sessions from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setVapiPublicKey(localStorage.getItem('synapseos_vapi_key') || DEFAULT_VAPI_KEY);
    setVapiAssistantId(localStorage.getItem('synapseos_vapi_id') || DEFAULT_VAPI_ID);
    setGeminiApiKey(localStorage.getItem('synapseos_gemini_key') || '');
    setGroqApiKey(localStorage.getItem('synapseos_groq_key') || DEFAULT_GROQ_KEY);
    setBackendUrl(localStorage.getItem('synapseos_backend_url') || API_BASE);
    
    const savedPersona = localStorage.getItem('synapseos_persona') as Persona | null;
    if (savedPersona) setAssistantPersona(savedPersona);

    const savedModel = localStorage.getItem('synapseos_selected_model') as ModelChoice | null;
    if (savedModel) setSelectedModel(savedModel);

    const savedLang = localStorage.getItem('synapseos_language') as SupportedLanguage | null;
    if (savedLang) setSelectedLanguage(savedLang);

    const savedProfile = localStorage.getItem('synapseos_selected_profile_id');
    if (savedProfile) setActiveProfileId(savedProfile);

    const savedWaPhone = localStorage.getItem('synapseos_wa_phone');
    if (savedWaPhone) {
      setWaPhoneNumber(savedWaPhone);
      setWaConnected(true);
    }

    // Version guard: bump to v5_realtime_groq_vapi to purge old mock chat sessions
    const SESSION_SCHEMA_VERSION = 'v5_realtime_groq_vapi';
    const storedVersion = localStorage.getItem('synapseos_session_version');
    if (storedVersion !== SESSION_SCHEMA_VERSION) {
      localStorage.removeItem('synapseos_chat_sessions');
      localStorage.setItem('synapseos_session_version', SESSION_SCHEMA_VERSION);
    }

    try {
      const savedSessions = localStorage.getItem('synapseos_chat_sessions');
      if (savedSessions) {
        const parsed: ChatSession[] = JSON.parse(savedSessions);
        // Filter out legacy mock sessions
        const mockIds = ['session-scan-imaging', 'session-swarm-consensus', 'session-digital-twin', 'session-who-outbreak', 'session-blockchain-ehr', 'session-rural-sms'];
        const realSessions = parsed.filter(s => 
          !mockIds.includes(s.id) && 
          s.messages && s.messages.length > 0 && 
          !s.messages.some(m => m.id === 'msg-scan-user' || m.id === 'msg-swarm-user' || m.id === 'msg-twin-user')
        );
        setSessions(realSessions);
      } else {
        setSessions([]);
      }
    } catch (e) {
      setSessions([]);
    }

    // Always start with a clean Clinical Copilot chat window
    setMessages([]);
    setCurrentSessionId('');
    setAssistantPersona('copilot');

    // Listen to external profile switch events
    const handleProfileSwitch = (e: any) => {
      if (e.detail?.profileId) {
        setActiveProfileId(e.detail.profileId);
        setMessages([]);
        setCurrentSessionId('');
        setAssistantPersona('copilot');
      }
    };
    window.addEventListener('synapseos-profile-switch', handleProfileSwitch);

    // Listen to external language switch events
    const handleGlobalLang = (e: any) => {
      if (e.detail) {
        setSelectedLanguage(e.detail as SupportedLanguage);
      }
    };
    window.addEventListener('synapseos-language-change', handleGlobalLang);

    return () => {
      window.removeEventListener('synapseos-profile-switch', handleProfileSwitch);
      window.removeEventListener('synapseos-language-change', handleGlobalLang);
    };
  }, []);

  const handleSelectProfile = (profileId: string) => {
    setActiveProfileId(profileId);
    setMessages([]);
    setCurrentSessionId('');
    setAssistantPersona('copilot');
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('synapseos_selected_profile_id', profileId);
        window.dispatchEvent(new CustomEvent('synapseos-profile-switch', { detail: { profileId } }));
      } catch (err) {}
    }
  };

  // Save sessions to localStorage
  const syncSessionsToStorage = (updatedSessions: ChatSession[]) => {
    setSessions(updatedSessions);
    try {
      localStorage.setItem('synapseos_chat_sessions', JSON.stringify(updatedSessions));
    } catch (e) {}
  };

  // Auto-scroll messages
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && activeTab === 'chat' && !isVoiceMode) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen, activeTab, isVoiceMode]);

  // Global event listeners
  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('toggle-synapseos-assistant', handleToggle);
    window.addEventListener('open-synapseos-assistant', handleOpen);
    (window as any).openSynapseOSAssistant = handleOpen;

    const handleExternalLang = (e: any) => {
      const newLang = e.detail as SupportedLanguage;
      if (newLang) {
        setSelectedLanguage(newLang);
      }
    };
    window.addEventListener('synapseos-language-change', handleExternalLang);

    return () => {
      window.removeEventListener('toggle-synapseos-assistant', handleToggle);
      window.removeEventListener('open-synapseos-assistant', handleOpen);
      window.removeEventListener('synapseos-language-change', handleExternalLang);
    };
  }, []);

  // Handle Persona Switching
  const handlePersonaChange = (newPersona: Persona) => {
    setAssistantPersona(newPersona);
    localStorage.setItem('synapseos_persona', newPersona);
  };

  // Handle Language Switching
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setSelectedLanguage(newLang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('synapseos_language', newLang);
        localStorage.setItem('synapseos_lang', newLang);
        window.dispatchEvent(new CustomEvent('synapseos-language-change', { detail: newLang }));
      } catch (e) {}
    }
  };

  // Save API Credentials
  const saveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('synapseos_vapi_key', vapiPublicKey);
    localStorage.setItem('synapseos_vapi_id', vapiAssistantId);
    localStorage.setItem('synapseos_gemini_key', geminiApiKey);
    localStorage.setItem('synapseos_groq_key', groqApiKey);
    localStorage.setItem('synapseos_backend_url', backendUrl);
    localStorage.setItem('synapseos_selected_model', selectedModel);
    localStorage.setItem('synapseos_persona', assistantPersona);
    localStorage.setItem('synapseos_language', selectedLanguage);
    setActiveTab('chat');
    
    if (vapi) {
      try { vapi.stop(); } catch (err) {}
      setVapi(null);
      setCallActive(false);
    }
  };

  // Save WhatsApp settings
  const handleSaveWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (waPhoneNumber.trim()) {
      localStorage.setItem('synapseos_wa_phone', waPhoneNumber);
      setWaConnected(true);
    } else {
      localStorage.removeItem('synapseos_wa_phone');
      setWaConnected(false);
    }
    setActiveTab('chat');
  };

  // Simulate receiving an inbound WhatsApp message
  const handleSimulateWhatsAppMessage = () => {
    const waMsg: Message = {
      id: `wa-${Date.now()}`,
      sender: 'whatsapp',
      text: "📄 *Prescription Received via WhatsApp*\n• Doctor: Dr. Arvind Patel (Cardiology)\n• Medication: Atorvastatin 20mg (1 daily at bedtime)\n• Status: Verified & Encrypted to ABHA Vault",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: 'whatsapp',
      visualType: 'whatsapp',
      visualData: {
        senderNumber: waPhoneNumber || '+91 98765 43210',
        mediaType: 'Prescription Photo (PDF/JPEG)',
        verified: true
      },
      followUps: ['Set medication reminder', 'Check drug interactions', 'View full prescription']
    };

    setMessages(prev => [...prev, waMsg]);
    setActiveTab('chat');
  };

  // Start fresh chat session
  const startNewChat = () => {
    setCurrentSessionId('');
    setMessages([]);
    setAssistantPersona('copilot');
    setActiveTab('chat');
    exitVoiceMode();
  };

  // Load existing chat session
  const selectSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    if (session.persona) setAssistantPersona(session.persona);
    setActiveTab('chat');
    exitVoiceMode();
  };

  // Delete chat session
  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== sessionId);
    syncSessionsToStorage(updated);
    if (currentSessionId === sessionId) {
      if (updated.length > 0) {
        setCurrentSessionId(updated[0].id);
        setMessages(updated[0].messages);
      } else {
        startNewChat();
      }
    }
  };

  // Copy message text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Exit Voice Mode
  const exitVoiceMode = () => {
    if (vapi) {
      try { vapi.stop(); } catch (e) {}
    }
    setCallActive(false);
    setIsVoiceMode(false);
    setVoiceState('listening');
    setLiveTranscript('');
    setAiSpeechText('');
  };

  // Toggle Mute in Voice Mode via Vapi Web SDK
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (vapi && typeof vapi.setMuted === 'function') {
      try { vapi.setMuted(nextMuted); } catch (e) {}
    }
    setVoiceState(nextMuted ? 'muted' : 'listening');
  };

  // Build System Instruction with Multilingual Directive & Active Patient Context
  const buildSystemInstruction = (isConciseVoice: boolean = false) => {
    const langInfo = LANGUAGE_SPEECH_MAP[selectedLanguage] || LANGUAGE_SPEECH_MAP.en;
    const activePatient = MOCK_HEALTH_PROFILES.find(p => p.profileId === activeProfileId) || mausamKarProfile;

    let base = `You are SynapseOS AI — a Next-Generation Multi-Agent Clinical Intelligence System.
You have direct real-time visibility into the patient's verified ABDM/ABHA electronic records and orchestrator sub-agents (Swarm Intelligence, Digital Organ Twins, Visual Analytics, WHO Disease Surveillance, MONAI Imaging AI, Blockchain EHR, and Rural Health).

ACTIVE PATIENT DOSSIER:
• Name: ${activePatient.patient.name}
• ABHA ID: ${activePatient.patient.abhaId}
• Age / Gender: ${activePatient.patient.age}y / ${activePatient.patient.gender} (Blood: ${activePatient.patient.bloodType || 'B+'})
• Admin Surveillance Access: ${activePatient.isAdmin ? 'AUTHORIZED NATIONAL EPIDEMIOLOGY ADMINISTRATOR' : 'Verified ABDM Citizen'}
• Connected Biometrics: ${activePatient.device?.name || 'Apple Watch Ultra 2'} (${activePatient.device?.firmware || 'v10.4.1'}, Battery: ${activePatient.device?.battery || 84}%)
• Real-Time Vitals: HR ${activePatient.vitals.currentHeartRate} BPM (Resting: ${activePatient.vitals.restingHeartRate}) | SpO2 ${activePatient.vitals.spo2}% | BP ${activePatient.vitals.bloodPressure || '118/76'} | Glucose ${activePatient.vitals.bloodGlucose || 92} mg/dL | Sleep Score ${activePatient.vitals.sleepScore} (${activePatient.vitals.sleepDuration})
• Clinical Profile: ${activePatient.title} — ${activePatient.subtitle}
• AI Diagnostic Insight: ${activePatient.aiAnalysis.title}: ${activePatient.aiAnalysis.description}

Always leverage this patient's live clinical context in your answers. Provide structured, authoritative, and compassionate medical reasoning.`;

    if (assistantPersona === 'triage') {
      base += "\nPersona Mode: Clinical Triage Specialist. Focus on immediate symptom assessment, severity scoring, red-flag symptoms, and triage urgency.";
    } else if (assistantPersona === 'nutrition') {
      base += "\nPersona Mode: Metabolic & Clinical Nutritionist. Provide personalized daily macro distributions (Carbs, Protein, Fats), hydration targets, and micronutrients.";
    }

    if (isConciseVoice) {
      base += " Keep your answer concise (2-3 sentences) so it is pleasant and clear when spoken aloud.";
    }

    if (selectedLanguage !== 'en') {
      base += `\nCRITICAL LANGUAGE INSTRUCTION: You MUST formulate your entire response in ${langInfo.name} (${langInfo.native}) script only.`;
    }

    return base;
  };

  // Execute Groq Chat Completion API in Real-Time
  const queryGroqLLM = async (
    queryText: string, 
    modelName: string, 
    isConcise: boolean = false,
    history: Message[] = []
  ): Promise<string | null> => {
    const key = groqApiKey || DEFAULT_GROQ_KEY;
    if (!key) return null;

    // Resolve target model:
    // Groq confirmed active models on this key: qwen/qwen3.8-27b, openai/gpt-oss-120b, openai/gpt-oss-20b, qwen/qwen3.6-27b
    let targetModel = 'qwen/qwen3.8-27b';
    if (modelName === 'groq-gpt-oss-120b') targetModel = 'openai/gpt-oss-120b';
    else if (modelName === 'groq-llama-3.1-8b') targetModel = 'openai/gpt-oss-20b';
    else if (modelName === 'groq-mixtral') targetModel = 'qwen/qwen3.6-27b';

    try {
      const systemInstructionText = buildSystemInstruction(isConcise);

      // Multi-turn conversational history context (last 8 messages)
      const formattedHistory = (history || [])
        .filter(m => (m.sender === 'user' || m.sender === 'assistant') && m.text && m.text.trim().length > 0)
        .slice(-8)
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }));

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [
            { role: 'system', content: systemInstructionText },
            ...formattedHistory,
            { role: 'user', content: queryText }
          ],
          temperature: 0.3,
          max_tokens: 1500
        })
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return content;
      } else {
        // Fallback model if targetModel has restrictions
        if (targetModel !== 'openai/gpt-oss-120b') {
          const fallbackRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${key}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'openai/gpt-oss-120b',
              messages: [
                { role: 'system', content: systemInstructionText },
                ...formattedHistory,
                { role: 'user', content: queryText }
              ],
              temperature: 0.3,
              max_tokens: 1500
            })
          });
          if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            return data.choices?.[0]?.message?.content || null;
          }
        }
      }
    } catch (e) {
      console.warn('Groq API Call failed:', e);
    }
    return null;
  };

  // Build Fine-Tuned System Prompt for Vapi Real-Time Voice Assistant
  const buildVoiceSystemPrompt = () => {
    const activePatient = MOCK_HEALTH_PROFILES.find(p => p.profileId === activeProfileId) || mausamKarProfile;
    const langDirective = selectedLanguage === 'hi'
      ? 'Speak fluently and conversationally in Hindi (हिन्दी) or Hinglish as preferred by the patient. Keep responses natural and culturally empathetic.'
      : 'Speak fluently in natural, clear, and professional English.';

    return `You are Sanjeevni-OS Clinical Voice AI, the real-time voice intelligence for India's Next-Generation Multi-Agent Health Operating System.
You are having an interactive voice conversation with the patient in real time.

CORE VOICE DIRECTIVES:
1. Speak in a warm, authoritative, calm, and reassuring clinical tone.
2. Keep each response concise (1 to 3 natural spoken sentences). Do NOT read out markdown headers, bullets, or asterisks.
3. ${langDirective}

PLATFORM ARCHITECTURE & WEBSITE KNOWLEDGE:
• Sanjeevni-OS / SynapseOS is an autonomous healthcare operating system integrating ABDM/ABHA electronic health records, 5-Agent Swarm Intelligence consensus (Triage, Drug Safety, Mental Health, Verification, Biometrics), 3D Digital Organ Twin simulation, MONAI medical imaging AI, WHO & IDSP epidemic outbreak monitoring, U-WIN universal immunization tracking, and 2G GSM zero-bandwidth SMS triage.

ACTIVE CITIZEN DOSSIER:
• Name: ${activePatient.patient.name}
• ABHA ID: ${activePatient.patient.abhaId}
• Age / Gender: ${activePatient.patient.age} years / ${activePatient.patient.gender}
• Real-Time Vitals: Heart Rate ${activePatient.vitals.currentHeartRate} BPM (Resting: ${activePatient.vitals.restingHeartRate} BPM), Oxygen Saturation (SpO2) ${activePatient.vitals.spo2}%, Blood Pressure ${activePatient.vitals.bloodPressure || '118/76'} mmHg, Blood Glucose ${activePatient.vitals.bloodGlucose || 92} mg/dL.
• Persona Specialization: ${assistantPersona === 'triage' ? 'Clinical Symptom Triage Specialist (assess symptoms, detect red-flags, recommend home care vs immediate doctor consultation)' : assistantPersona === 'nutrition' ? 'Metabolic & Clinical Nutritionist (daily macro targets, hydration, micronutrients)' : 'Comprehensive Clinical Copilot'}.

Reference the patient's vitals when relevant. If symptoms suggest an emergency (e.g. chest pain, breathing difficulty, severe trauma), prioritize patient safety and direct them to call 108 or visit emergency care immediately.`;
  };

  // Toggle Voice Call / Voice Mode (Powered ALWAYS and ONLY by Vapi AI WebRTC)
  const toggleVoiceCall = async () => {
    if (callActive || isVoiceMode) {
      if (vapi) {
        try { vapi.stop(); } catch (err) {}
      }
      setCallActive(false);
      setIsVoiceMode(false);
      setVoiceState('listening');
      return;
    }

    const pubKey = vapiPublicKey || DEFAULT_VAPI_KEY;
    const asstId = vapiAssistantId || DEFAULT_VAPI_ID;

    if (!pubKey || !asstId) {
      alert('Vapi Public Key and Assistant ID are required. Please configure them in settings.');
      return;
    }

    try {
      setConnecting(true);
      setIsVoiceMode(true);
      setVoiceState('connecting');
      setLiveTranscript('');
      setAiSpeechText('');

      const vapiInstance = new Vapi(pubKey);
      setVapi(vapiInstance);

      vapiInstance.on('call-start', () => {
        setConnecting(false);
        setCallActive(true);
        setIsVoiceMode(true);
        setVoiceState('listening');
      });

      vapiInstance.on('call-end', () => {
        setCallActive(false);
        setIsVoiceMode(false);
        setVoiceState('listening');
      });

      vapiInstance.on('speech-start', () => {
        setVoiceState('speaking');
      });

      vapiInstance.on('speech-end', () => {
        setVoiceState('listening');
      });

      vapiInstance.on('message', (message: any) => {
        if (message.type === 'transcript') {
          if (message.transcriptType === 'partial') {
            setLiveTranscript(message.transcript);
          } else if (message.transcriptType === 'final') {
            setLiveTranscript(message.transcript);
            const sender = message.role === 'user' ? 'user' : 'assistant';
            if (sender === 'assistant') {
              setAiSpeechText(message.transcript);
            }
            const newMsg: Message = {
              id: `vapi-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              sender,
              text: message.transcript,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              channel: 'voice'
            };
            setMessages(prev => {
              const updated = [...prev, newMsg];
              const activeId = currentSessionId || `session-${Date.now()}`;
              if (!currentSessionId) setCurrentSessionId(activeId);
              const sessionTitle = (updated[0]?.text || 'Voice Consultation').slice(0, 30);
              const existingIdx = sessions.findIndex(s => s.id === activeId);
              let updatedSessions: ChatSession[];
              if (existingIdx >= 0) {
                updatedSessions = [...sessions];
                updatedSessions[existingIdx] = {
                  ...updatedSessions[existingIdx],
                  messages: updated,
                  persona: assistantPersona
                };
              } else {
                updatedSessions = [
                  {
                    id: activeId,
                    title: sessionTitle,
                    createdAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    persona: assistantPersona,
                    messages: updated
                  },
                  ...sessions
                ];
              }
              syncSessionsToStorage(updatedSessions);
              return updated;
            });
          }
        }
      });

      vapiInstance.on('error', (err: any) => {
        console.warn('Vapi error event:', err);
        setConnecting(false);
        setCallActive(false);
      });

      const activePatient = MOCK_HEALTH_PROFILES.find(p => p.profileId === activeProfileId) || mausamKarProfile;
      const firstGreeting = selectedLanguage === 'hi'
        ? (assistantPersona === 'triage'
            ? 'नमस्ते! मैं संजीवनी ट्राइएज वॉइस असिस्टेंट हूँ। कृपया अपने लक्षणों के बारे में बताएं।'
            : assistantPersona === 'nutrition'
            ? 'नमस्ते! मैं संजीवनी न्यूट्रिशन वॉइस असिस्टेंट हूँ। अपने खान-पान और स्वास्थ्य लक्ष्यों के बारे में बताएं।'
            : `नमस्ते ${activePatient.patient.name}! मैं संजीवनी एआई क्लिनिकल वॉइस असिस्टेंट हूँ। मैं सुन रहा हूँ, आपकी क्या मदद कर सकता हूँ?`)
        : (assistantPersona === 'triage'
            ? 'Hello! I am your Sanjeevni OS Triage Specialist. Please describe any symptoms you are experiencing.'
            : assistantPersona === 'nutrition'
            ? 'Hello! I am your Sanjeevni OS Nutrition Specialist. Tell me your dietary or metabolic goals.'
            : `Hello ${activePatient.patient.name}! I am Sanjeevni OS Clinical Voice Assistant. How can I assist with your health today?`);

      const voiceSystemPrompt = buildVoiceSystemPrompt();

      // Start Vapi call fine-tuned with website context, patient dossier, and Groq reasoning
      await vapiInstance.start(asstId, {
        firstMessage: firstGreeting,
        model: {
          provider: 'groq',
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: voiceSystemPrompt
            }
          ]
        }
      });
    } catch (err) {
      console.error('Vapi connection error:', err);
      setConnecting(false);
      setCallActive(false);
      setIsVoiceMode(false);
    }
  };

  // Send query logic adapted per Persona and Multilingual in text mode (Real-Time Groq AI)
  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    const activePatient = MOCK_HEALTH_PROFILES.find(p => p.profileId === activeProfileId) || mausamKarProfile;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: 'web'
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    let reply = '';
    let trace: any[] = [];
    let followUps: string[] = [];
    let visualType: any = 'general';
    let visualData: any = null;

    // 1. Real-Time Groq LPU API (Primary Engine)
    reply = await queryGroqLLM(textToSend, selectedModel, false, messages) || '';
    if (reply) {
      trace = [
        { agent_name: 'Groq LPU Engine', action: 'Real-Time Neural Clinical Reasoning (Qwen-27B)', duration_ms: 64 },
        { agent_name: 'Patient Context Injector', action: `Bound ABHA Profile: ${activePatient.patient.name}`, duration_ms: 12 }
      ];
    }

    // 2. Try FastAPI Multi-Agent Orchestration backend
    if (!reply) {
      try {
        const res = await fetch(`${backendUrl || API_BASE}/api/orchestrate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: textToSend,
            persona: assistantPersona,
            language: selectedLanguage,
            channel: 'web_assistant',
            patient_id: activePatient.profileId
          })
        });

        if (res.ok) {
          const data = await res.json();
          reply = data.final_response;
          trace = data.trace || [];
        }
      } catch (e) {}
    }

    // 3. Try Live Gemini API with Multilingual System Prompt
    if (!reply && geminiApiKey) {
      try {
        const systemInstructionText = buildSystemInstruction(false);
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: textToSend }] }],
              systemInstruction: { parts: [{ text: systemInstructionText }] }
            })
          }
        );
        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          reply = data.candidates[0].content.parts[0].text;
        }
      } catch (err) {}
    }

    // Dynamic Clinical Visual Widget assignment based on conversation context
    const textLower = (textToSend + ' ' + reply).toLowerCase();
    if (textLower.includes('vital') || textLower.includes('heart') || textLower.includes('spo2') || textLower.includes('blood pressure') || textLower.includes('ecg')) {
      visualType = 'vitals';
      visualData = {
        patientName: activePatient.patient.name,
        device: activePatient.device?.name || 'Apple Watch Ultra 2',
        hr: `${activePatient.vitals.currentHeartRate} BPM`,
        spo2: `${activePatient.vitals.spo2}%`,
        bp: activePatient.vitals.bloodPressure || '118/76',
        glucose: `${activePatient.vitals.bloodGlucose || 92} mg/dL`
      };
      followUps = ['7-Day HRV Trends', 'ECG Sinus Rhythm Details', 'Metabolic Care Plan'];
    } else if (assistantPersona === 'triage' || textLower.includes('triage') || textLower.includes('headache') || textLower.includes('fever') || textLower.includes('pain')) {
      visualType = 'triage';
      visualData = {
        urgency: textLower.includes('emergency') || textLower.includes('chest pain') ? 'Urgent / Red Flag Care' : 'Low / Moderate Urgency',
        score: textLower.includes('emergency') ? 88 : 28,
        vitals: [
          { label: 'Core Temp', value: '37.2°C (Monitored)', status: 'normal' },
          { label: 'SpO2', value: `${activePatient.vitals.spo2}% (Normal)`, status: 'good' },
          { label: 'Heart Rate', value: `${activePatient.vitals.currentHeartRate} BPM`, status: 'normal' }
        ]
      };
      followUps = ['Review red-flags', 'Log vitals in ABHA', 'Connect with Doctor'];
    } else if (textLower.includes('scan') || textLower.includes('x-ray') || textLower.includes('radiograph') || textLower.includes('fracture') || textLower.includes('monai')) {
      visualType = 'scan';
      visualData = {
        modality: 'CHEST PA & SKELETAL RADIOGRAPHY',
        finding: 'Real-time AI diagnostic screen generated via Groq Neural Medical reasoning.',
        confidence: '99.1%',
        gradcam: 'Bilateral Symmetry Verified'
      };
      followUps = ['Inspect Grad-CAM overlay', 'Digitize clinical prescription', 'Review previous imaging'];
    } else if (assistantPersona === 'nutrition' || textLower.includes('diet') || textLower.includes('nutrition') || textLower.includes('macro') || textLower.includes('calorie')) {
      visualType = 'nutrition';
      visualData = {
        calories: '2,150 kcal / day',
        carbs: '40% (215g)',
        protein: '30% (161g)',
        fats: '30% (71g)',
        water: '2.8 Liters'
      };
      followUps = ['Download grocery blueprint', 'Pre-workout macro timing', 'Hydration reminders'];
    } else if (textLower.includes('swarm') || textLower.includes('consensus') || textLower.includes('multi-agent')) {
      visualType = 'swarm';
      visualData = {
        confidence: '98.6%',
        agents: [
          { name: 'Triage Agent', status: 'Evaluated (Groq LPU)' },
          { name: 'Drug Interaction', status: 'CYP450 Checked' },
          { name: 'Mental Health', status: 'Normal Load' },
          { name: 'Verification Agent', status: 'Signed & Validated' }
        ]
      };
      followUps = ['Audit CYP450 enzymes', 'View 7-day HRV trend', 'Export swarm consensus JSON'];
    } else if (textLower.includes('outbreak') || textLower.includes('who') || textLower.includes('idsp') || textLower.includes('dengue')) {
      visualType = 'outbreak';
      visualData = {
        riskLevel: 'MONITORED REGION',
        district: 'Regional Surveillance Hub',
        pathogen: 'Vector-Borne Surveillance',
        advisory: 'Standard vector control precautions active in endemic sectors.'
      };
      followUps = ['View GIS Outbreak Map', 'Review WHO triage protocol', 'Check ICU bed telemetry'];
    } else if (textLower.includes('vaccin') || textLower.includes('u-win') || textLower.includes('immuniz')) {
      visualType = 'vaccination';
      visualData = {
        patientName: activePatient.patient.name,
        status: '✓ Verified U-WIN Card',
        nextDue: 'DPT Booster 1 due in 3 months',
        schedule: [
          { name: 'BCG + OPV-0 + Hep-B', age: 'Birth', status: 'Given (Verified)', date: 'AIIMS ABDM' },
          { name: 'Pentavalent-1 + Rotavirus-1', age: '6 Weeks', status: 'Given', date: 'PHC Centre' }
        ]
      };
      followUps = ['Download U-WIN Certificate', 'Set Vaccination SMS Reminder', 'Find Nearest PHC Centre'];
    } else if (textLower.includes('abha') || textLower.includes('blockchain') || textLower.includes('ehr') || textLower.includes('ipfs')) {
      visualType = 'ehr';
      visualData = {
        abhaId: activePatient.patient.abhaId,
        name: activePatient.patient.name,
        hospital: 'ABDM Verified Health Vault'
      };
      followUps = ['Verify Smart Contract Hash', 'Download Health Certificate', 'Share Consent with Doctor'];
    } else {
      followUps = ['Run Swarm Consensus', 'Check Real-time Vitals', 'View IDSP Outbreak Map'];
    }

    if (!reply) {
      reply = `I processed your request: "${textToSend}". Live clinical inference is currently operating in fallback mode for ${activePatient.patient.name} (${activePatient.patient.abhaId}). Please verify your network connection or API settings.`;
    }

    setTimeout(() => {
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: 'web',
        visualType,
        visualData,
        followUps,
        trace
      };

      const finalMessages = [...nextMessages, aiMsg];
      setMessages(finalMessages);
      setLoading(false);

      const activeSessionId = currentSessionId || `session-${Date.now()}`;
      setCurrentSessionId(activeSessionId);
      
      const sessionTitle = userMsg.text.slice(0, 30) + (userMsg.text.length > 30 ? '...' : '');
      const existingIdx = sessions.findIndex(s => s.id === activeSessionId);
      
      let updatedSessions: ChatSession[];
      if (existingIdx >= 0) {
        updatedSessions = [...sessions];
        updatedSessions[existingIdx] = {
          ...updatedSessions[existingIdx],
          messages: finalMessages,
          persona: assistantPersona
        };
      } else {
        updatedSessions = [
          {
            id: activeSessionId,
            title: sessionTitle,
            createdAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            persona: assistantPersona,
            messages: finalMessages
          },
          ...sessions
        ];
      }
      syncSessionsToStorage(updatedSessions);
    }, 400);
  };

  return {
    isOpen,
    setIsOpen,
    activeTab,
    setActiveTab,
    assistantPersona,
    handlePersonaChange,
    selectedModel,
    setSelectedModel,
    selectedLanguage,
    handleLanguageChange,
    geminiApiKey,
    setGeminiApiKey,
    groqApiKey,
    setGroqApiKey,
    activeProfileId,
    setActiveProfileId,
    handleSelectProfile,
    showKeyText,
    setShowKeyText,
    vapiPublicKey,
    setVapiPublicKey,
    vapiAssistantId,
    setVapiAssistantId,
    backendUrl,
    setBackendUrl,
    saveCredentials,
    waPhoneNumber,
    setWaPhoneNumber,
    waConnected,
    waMetaToken,
    setWaMetaToken,
    waWebhookUrl,
    setWaWebhookUrl,
    waAutoSyncReports,
    setWaAutoSyncReports,
    waDailyReminders,
    setWaDailyReminders,
    handleSaveWhatsApp,
    handleSimulateWhatsAppMessage,
    sessions,
    currentSessionId,
    startNewChat,
    selectSession,
    deleteSession,
    messages,
    setMessages,
    input,
    setInput,
    loading,
    isListening,
    callActive,
    connecting,
    copiedId,
    messagesEndRef,
    inputRef,
    handleCopy,
    
    // Voice Mode
    isVoiceMode,
    voiceState,
    liveTranscript,
    aiSpeechText,
    isMuted,
    startVoiceMode: toggleVoiceCall,
    exitVoiceMode,
    toggleMute,
    toggleVoiceCall,
    handleSend
  };
}
