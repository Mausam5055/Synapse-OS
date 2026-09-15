'use client';

import React from 'react';
import { MockHealthProfile } from '@/data/mockHealthProfiles';
import { Persona, Message } from '../types';
import ChatStream from '../components/ChatStream';
import { SupportedLanguage } from '../types';
import { getTranslation } from '../translations';
import { SUPPORTED_LANGUAGES } from '../components/SettingsDrawer';
import { 
  Sparkles, 
  Stethoscope, 
  Radio, 
  ScanLine, 
  FileText, 
  Smartphone, 
  Send, 
  Mic, 
  Activity, 
  ShieldCheck, 
  Plus,
  Heart,
  ChevronDown,
  Globe,
  Settings,
  Minimize2,
  X,
  MessageCircle
} from 'lucide-react';

interface ChatCanvasProps {
  currentProfile?: MockHealthProfile;
  assistantPersona: Persona;
  onPersonaChange: (p: Persona) => void;
  messages?: Message[];
  loading?: boolean;
  copiedId?: string | null;
  messagesEndRef?: React.RefObject<HTMLDivElement | null>;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  input?: string;
  setInput: (val: string) => void;
  isListening?: boolean;
  callActive?: boolean;
  onSend: (text?: string) => void;
  onToggleVoice: () => void;
  onCopy: (id: string, text: string) => void;
  onNewChat?: () => void;
  selectedLanguage?: SupportedLanguage;
  onLanguageChange?: (lang: SupportedLanguage) => void;
  onOpenWhatsApp?: () => void;
  onOpenSettings?: () => void;
  onToggleFullscreen?: () => void;
  onClose?: () => void;
}

export default function ChatCanvas({
  currentProfile,
  assistantPersona = 'copilot',
  onPersonaChange,
  messages = [],
  loading = false,
  copiedId = null,
  messagesEndRef,
  inputRef,
  input = '',
  setInput,
  isListening = false,
  callActive = false,
  onSend,
  onToggleVoice,
  onCopy,
  onNewChat,
  selectedLanguage = 'en',
  onLanguageChange,
  onOpenWhatsApp,
  onOpenSettings,
  onToggleFullscreen,
  onClose
}: ChatCanvasProps) {
  const [langDropdownOpen, setLangDropdownOpen] = React.useState(false);
  const langDropdownRef = React.useRef<HTMLDivElement>(null);

  const t = getTranslation(selectedLanguage);
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const patientName = currentProfile?.patient?.name || 'Mausam Kar';
  const patientAbha = currentProfile?.patient?.abhaId || '91-7294-8102-5309';
  const heartRate = currentProfile?.vitals?.currentHeartRate || 74;
  const spo2 = currentProfile?.vitals?.spo2 || 98.5;
  const bloodPressure = currentProfile?.vitals?.bloodPressure || '118/76';
  const deviceName = currentProfile?.device?.name || 'Apple Watch Ultra 2';
  const deviceBattery = currentProfile?.device?.battery || 92;

  // Dynamic Persona Details & Curated Prompts
  const getPersonaConfig = () => {
    switch (assistantPersona) {
      case 'triage':
        return {
          title: t.personas.triage.full,
          description: t.personas.triage.desc,
          prompts: [
            {
              title: 'Emergency Red-Flag Scoring',
              category: 'Acuity Assessment',
              icon: Stethoscope,
              color: '#dc2626',
              query: `Assess acute symptom severity and red-flags for ${patientName}. Calculate clinical triage score and emergency priority level.`
            },
            {
              title: '2G GSM SMS Rural Triage',
              category: 'Zero-Bandwidth Reach',
              icon: Smartphone,
              color: '#d97706',
              query: `Generate a 160-character plain-text zero-bandwidth 2G GSM SMS triage and emergency fever alert in Hindi and English for rural community dispatch.`
            },
            {
              title: 'Febrile & Hydration Protocol',
              category: 'Symptom Triage',
              icon: Activity,
              color: '#0284c7',
              query: `Evaluate acute fever progression, fluid hydration needs, and electrolyte balance protocols for ${patientName}.`
            },
            {
              title: 'PHC Emergency Dispatch',
              category: 'Emergency Protocol',
              icon: ShieldCheck,
              color: '#059669',
              query: `Check regional primary health centre (PHC) availability and generate an emergency clinical handover report for ${patientName}.`
            }
          ]
        };
      case 'nutrition':
        return {
          title: t.personas.nutrition.full,
          description: t.personas.nutrition.desc,
          prompts: [
            {
              title: 'Daily Macro & Calorie Blueprint',
              category: 'Metabolic Blueprint',
              icon: Activity,
              color: '#059669',
              query: `Calculate daily caloric expenditure, lean protein requirements (130g), complex carbs, and healthy fats distribution for ${patientName}.`
            },
            {
              title: 'Glycemic Index & Glucose Control',
              category: 'Glucose Stability',
              icon: Sparkles,
              color: '#7c3aed',
              query: `Generate a low glycemic index meal plan and post-prandial glucose stability guidelines based on current resting vitals.`
            },
            {
              title: 'Cardiovascular Dietetics',
              category: 'Heart-Healthy Nutrition',
              icon: Heart,
              color: '#db2777',
              query: `Create a low-sodium, heart-healthy dietary plan optimized for blood pressure ${bloodPressure} and resting heart rate ${heartRate} BPM.`
            },
            {
              title: 'Micronutrient & Hydration Matrix',
              category: 'Electrolyte Protocol',
              icon: ShieldCheck,
              color: '#0284c7',
              query: `Assess daily electrolyte hydration, essential vitamin markers, and recovery micronutrient blueprint for ${patientName}.`
            }
          ]
        };
      case 'orchestrator':
        return {
          title: t.personas.orchestrator.full,
          description: t.personas.orchestrator.desc,
          prompts: [
            {
              title: 'WHO Outbreak & IDSP Radar',
              category: 'Epidemic Surveillance',
              icon: Radio,
              color: '#dc2626',
              query: `Fetch WHO & IDSP regional disease surveillance report for Delhi NCR. Check Dengue, Chikungunya, and Nipah alert status and hospital ICU readiness.`
            },
            {
              title: 'U-WIN Vaccination Schedule',
              category: 'Public Immunization',
              icon: ShieldCheck,
              color: '#059669',
              query: `Query Universal Immunization Programme (U-WIN / UIP) records and childhood/adult vaccination timelines for ${patientName}. Verify booster status and upcoming milestone vaccines.`
            },
            {
              title: 'GIS Vector Containment Matrix',
              category: 'Disease Containment',
              icon: Activity,
              color: '#d97706',
              query: `Analyze regional epidemiological hotspot density, vector-borne transmission rates, and emergency mosquito containment zones.`
            },
            {
              title: 'District ICU Bed Telemetry',
              category: 'Hospital Capacity',
              icon: Sparkles,
              color: '#0284c7',
              query: `Audit regional hospital ICU load (68% current load), oxygen supply telemetry, and emergency fever ward capacity across surveillance nodes.`
            }
          ]
        };
      default: // copilot
        return {
          title: t.personas.copilot.full,
          description: t.personas.copilot.desc,
          prompts: [
            {
              title: 'Swarm Multi-Agent Consensus',
              category: 'Multi-Agent AI',
              icon: Sparkles,
              color: '#0284c7',
              query: `Execute Swarm Intelligence 5-agent consensus for patient ${patientName} (${patientAbha}) covering Clinical Triage, Pharmacogenomics, Mental Health, and Biometrics.`
            },
            {
              title: 'MONAI & YOLOv8 Scan AI',
              category: 'Diagnostic Radiology',
              icon: ScanLine,
              color: '#4f46e5',
              query: `Run MONAI Chest X-Ray and YOLOv8 trauma fracture screening for ${patientName}. Check for pulmonary infiltrates and skeletal fractures.`
            },
            {
              title: 'Organ Twin Telemetry',
              category: 'Digital Health Twin',
              icon: Stethoscope,
              color: '#db2777',
              query: `Evaluate pulmonary, cardiovascular, and metabolic telemetry for ${patientName}. Heart Rate: ${heartRate} BPM, SpO2: ${spo2}%, Blood Pressure: ${bloodPressure}.`
            },
            {
              title: 'Blockchain ABHA EHR Vault',
              category: 'ABDM Interoperability',
              icon: FileText,
              color: '#7c3aed',
              query: `Query ABDM blockchain gateway for longitudinal health records and IPFS-verified clinical history linked to ABHA ID ${patientAbha} (${patientName}).`
            }
          ]
        };
    }
  };

  const personaConfig = getPersonaConfig();
  const safeMessages = Array.isArray(messages) ? messages : [];

  return (
    // ⚠️ CRITICAL: flex:1 + alignSelf:stretch — NOT height:'100%' — as flex-row child
    <div style={{
      flex: '1 1 0%',
      minWidth: 0,
      alignSelf: 'stretch',
      display: 'flex',
      flexDirection: 'column',
      background: '#ffffff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* ── Sleek Minimalist Top Navigation & Persona Control ── */}
      <div style={{
        height: '46px',
        padding: '0 20px',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        {/* Left: Clean Active Persona Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'inline-block',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
          }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
            {assistantPersona === 'triage' ? t.personas.triage.full
              : assistantPersona === 'nutrition' ? t.personas.nutrition.full
              : assistantPersona === 'orchestrator' ? t.personas.orchestrator.full
              : t.personas.copilot.full}
          </span>
          <span style={{ color: '#cbd5e1', fontSize: '11px' }}>•</span>
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>
            {t.consultationWith}: <b style={{ color: '#0f172a' }}>{patientName}</b>
          </span>
        </div>

        {/* Right: Sleek Segmented Persona Switcher + Language Selector + Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Persona Switcher Segmented Tabs */}
          <div style={{
            display: 'flex',
            background: '#f1f5f9',
            padding: '3px',
            borderRadius: '8px',
            gap: '2px'
          }}>
            {[
              { id: 'copilot', label: t.personas.copilot.label, icon: '🏥' },
              { id: 'triage', label: t.personas.triage.label, icon: '🩺' },
              { id: 'nutrition', label: t.personas.nutrition.label, icon: '🥗' },
              { id: 'orchestrator', label: t.personas.orchestrator.label, icon: '🌐' }
            ].map(p => {
              const isAct = assistantPersona === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onPersonaChange(p.id as Persona)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: isAct ? '#0f172a' : 'transparent',
                    color: isAct ? '#ffffff' : '#64748b',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: isAct ? 700 : 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                    boxShadow: isAct ? '0 1px 4px rgba(0,0,0,0.12)' : 'none'
                  }}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* New Chat Button */}
          {onNewChat && (
            <button
              onClick={onNewChat}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 10px',
                borderRadius: '7px',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 4px rgba(2, 132, 199, 0.25)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#0369a1'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#0284c7'}
              title="Start a fresh chat consultation"
            >
              <Plus size={13} />
              <span>{t.newChat}</span>
            </button>
          )}

          {/* Divider */}
          <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 2px' }} />

          {/* Multilingual Language Switcher Dropdown */}
          <div ref={langDropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setLangDropdownOpen(prev => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 9px',
                borderRadius: '7px',
                background: '#f0fdf4',
                border: '1.2px solid #86efac',
                color: '#166534',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Switch Language / भाषा बदलें"
            >
              <span>{currentLangObj.flag}</span>
              <span>{currentLangObj.native}</span>
              <ChevronDown size={11} color="#166534" />
            </button>

            {langDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '36px',
                right: '0',
                width: '280px',
                background: '#ffffff',
                borderRadius: '12px',
                border: '1.2px solid #cbd5e1',
                boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
                zIndex: 9999,
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                maxHeight: '360px',
                overflowY: 'auto'
              }}>
                <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', padding: '4px 6px', letterSpacing: '0.04em' }}>
                  🌐 SELECT LANGUAGE (11 INDIC LANGUAGES)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isSelected = lang.code === selectedLanguage;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onLanguageChange) {
                            onLanguageChange(lang.code);
                          }
                          try {
                            localStorage.setItem('synapseos_language', lang.code);
                            localStorage.setItem('synapseos_lang', lang.code);
                            window.dispatchEvent(new CustomEvent('synapseos-language-change', { detail: lang.code }));
                          } catch (err) {}
                          setLangDropdownOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          background: isSelected ? '#ecfdf5' : '#f8fafc',
                          border: isSelected ? '1.2px solid #10b981' : '1px solid #e2e8f0',
                          color: isSelected ? '#047857' : '#1e293b',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span style={{ fontSize: '13px' }}>{lang.flag}</span>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '10.5px', fontWeight: 800, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {lang.native}
                          </div>
                          <div style={{ fontSize: '8.5px', color: '#64748b' }}>
                            {lang.name}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp Bridge Button */}
          {onOpenWhatsApp && (
            <button
              onClick={onOpenWhatsApp}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '7px',
                background: '#f0fdf4',
                border: '1px solid #86efac',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="WhatsApp AI QR Bridge"
            >
              <MessageCircle size={14} />
            </button>
          )}

          {/* AI Settings Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '7px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="AI Settings & API Models"
            >
              <Settings size={14} />
            </button>
          )}

          {/* Fullscreen / Minimize Toggle Button */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '7px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Minimize to Floating Window (Esc)"
            >
              <Minimize2 size={13} />
            </button>
          )}

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '7px',
                background: '#fee2e2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Close Assistant"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Conversation Stream Container ── */}
      <div 
        data-lenis-prevent="true"
        className="synapseos-custom-scroll"
        onWheel={(e) => e.stopPropagation()}
        style={{
          flex: '1 1 0%',
          minHeight: 0,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ maxWidth: '820px', width: '100%', margin: '0 auto', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          {safeMessages.length === 0 ? (
            /* Rich Public Health & Orchestrator Welcome State */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              textAlign: 'center',
              padding: '32px 12px',
              gap: '16px'
            }}>
              <div style={{ position: 'relative' }}>
                <img 
                  src="/synapseos-icon.svg" 
                  alt="SynapseOS Logo" 
                  style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'contain', boxShadow: '0 8px 24px rgba(2, 132, 199, 0.2)' }}
                />
              </div>

              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.3px' }}>
                  {personaConfig.title}
                </h2>
                <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px', maxWidth: '560px', lineHeight: 1.5 }}>
                  {personaConfig.description}
                </p>
              </div>

              {/* Persona-Specific Dynamic Action Prompts */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                width: '100%',
                maxWidth: '740px',
                marginTop: '6px'
              }}>
                {personaConfig.prompts.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => onSend(action.query)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: '#f8fafc',
                        border: '1.2px solid #e2e8f0',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px',
                        transition: 'all 0.15s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = action.color;
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 800, color: action.color, textTransform: 'uppercase' }}>
                        <Icon size={12} />
                        <span>{action.category}</span>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                        {action.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <ChatStream
              messages={safeMessages}
              loading={loading}
              copiedId={copiedId}
              messagesEndRef={messagesEndRef as any}
              onCopy={onCopy}
              onSendChip={onSend}
            />
          )}
        </div>
      </div>

      {/* ── Fixed Bottom Input Bar ── */}
      <div style={{
        height: '72px',
        padding: '12px 24px',
        background: '#ffffff',
        borderTop: '1.2px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSend();
          }}
          style={{
            maxWidth: '820px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1.5px solid #0284c7',
            boxShadow: '0 4px 16px rgba(2, 132, 199, 0.08)',
            padding: '6px 10px 6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder={
              assistantPersona === 'triage'
                ? t.placeholders.triage
                : assistantPersona === 'nutrition'
                ? t.placeholders.nutrition
                : assistantPersona === 'orchestrator'
                ? t.placeholders.orchestrator
                : t.placeholders.copilot
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '13.5px',
              color: '#0f172a'
            }}
          />

          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={onToggleVoice}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: callActive || isListening ? '#fee2e2' : '#f0fdf4',
              color: callActive || isListening ? '#dc2626' : '#15803d',
              border: callActive || isListening ? '1.5px solid #ef4444' : '1px solid #86efac',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title={callActive || isListening ? "Stop Voice Mode" : "Start Live AI Voice Mode"}
          >
            <Mic size={15} />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: input.trim() ? '#0284c7' : '#f1f5f9',
              color: input.trim() ? '#ffffff' : '#94a3b8',
              border: 'none',
              fontSize: '12px',
              fontWeight: 800,
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>{t.send}</span>
            <Send size={12} />
          </button>
        </form>
      </div>
    </div>
  );
}

