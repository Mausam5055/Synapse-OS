export type Persona = 'copilot' | 'triage' | 'nutrition' | 'orchestrator';
export type ActiveTab = 'chat' | 'history' | 'settings' | 'whatsapp';
export type ModelChoice = 
  | 'gemini-3.5-flash'
  | 'gemini-2.5-flash'
  | 'gemini-3.5-flash-lite'
  | 'gemini-2.0-flash'
  | 'gemini-1.5-flash' 
  | 'gemini-1.5-pro' 
  | 'groq-qwen-27b'
  | 'groq-gpt-oss-120b'
  | 'groq-llama-3.3-70b' 
  | 'groq-llama-3.1-8b' 
  | 'groq-mixtral';
export type VoiceState = 'connecting' | 'listening' | 'thinking' | 'speaking' | 'muted';
export type SupportedLanguage = 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'mr' | 'gu' | 'kn' | 'ml' | 'pa' | 'or';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  native: string;
  speechCode: string;
  flag: string;
}

export interface TraceItem {
  agent_name: string;
  action: string;
  duration_ms: number;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant' | 'system' | 'whatsapp';
  text: string;
  timestamp: string;
  channel?: 'web' | 'whatsapp' | 'voice';
  visualType?: 'triage' | 'nutrition' | 'records' | 'whatsapp' | 'swarm' | 'vitals' | 'scan' | 'outbreak' | 'ehr' | 'vaccination' | 'rural_sms' | 'general';
  visualData?: any;
  followUps?: string[];
  trace?: TraceItem[];
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  persona: Persona;
  messages: Message[];
}
