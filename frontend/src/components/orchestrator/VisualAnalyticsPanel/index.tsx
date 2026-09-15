'use client';

import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  ArrowUpRight, 
  Heart, 
  Moon, 
  Brain, 
  Footprints, 
  CheckCircle2, 
  Clock, 
  Folder, 
  Calendar as CalendarIcon, 
  MoreVertical,
  Droplets,
  Pill,
  ChevronRight,
  TrendingUp,
  Activity,
  Upload,
  Download,
  Zap,
  ChevronDown
} from 'lucide-react';
import { PatientInfo, VitalsData } from '../types';
import { MOCK_HEALTH_PROFILES, MockHealthProfile } from '@/data/mockHealthProfiles';
import { useLanguage } from '@/context/LanguageContext';

interface VisualAnalyticsPanelProps {
  patient?: PatientInfo;
  vitals?: VitalsData;
  activeProfile?: MockHealthProfile;
  selectedProfileId?: string;
  onSelectProfile?: (id: string) => void;
  onOpenExportModal?: () => void;
}

export default function VisualAnalyticsPanel({
  patient,
  vitals,
  activeProfile: propActiveProfile,
  selectedProfileId: propSelectedProfileId,
  onSelectProfile,
  onOpenExportModal
}: VisualAnalyticsPanelProps) {
  const { t, translateText } = useLanguage();
  const [chatMessage, setChatMessage] = useState('');
  const [localSelectedProfileId, setLocalSelectedProfileId] = useState<string>('mausam_kar_verified_abha');
  const [customProfile, setCustomProfile] = useState<MockHealthProfile | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Synchronized active dataset
  const activeProfile: MockHealthProfile = customProfile || 
    propActiveProfile || 
    MOCK_HEALTH_PROFILES.find(p => p.profileId === (propSelectedProfileId || localSelectedProfileId)) || 
    MOCK_HEALTH_PROFILES[0];

  const currentSelectedId = propSelectedProfileId || localSelectedProfileId;

  const handleOpenSynapseOSAI = (promptText?: string) => {
    const text = promptText || chatMessage || '';
    setChatMessage('');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-synapseos-assistant', {
        detail: { prompt: text }
      }));
      if (typeof (window as any).openSynapseOSAssistant === 'function') {
        (window as any).openSynapseOSAssistant();
      }
      const triggerBtn = document.querySelector('.synapseos-trigger-pill, .synapseos-trigger-btn') as HTMLElement;
      if (triggerBtn) {
        triggerBtn.click();
      }
    }
  };

  // Switch pre-loaded clinical dataset
  const handleSelectProfile = (profileId: string) => {
    setLocalSelectedProfileId(profileId);
    setCustomProfile(null);
    setIsDropdownOpen(false);
    
    if (onSelectProfile) {
      onSelectProfile(profileId);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('synapseos-profile-switch', {
        detail: { profileId }
      }));
    }

    const target = MOCK_HEALTH_PROFILES.find(p => p.profileId === profileId);
    if (target) {
      setStatusMessage(`✅ Telemetry synchronized with ${target.title} (${target.patient.name})`);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Direct JSON file upload
  const handleDirectJsonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.visualAnalytics && parsed.patient) {
          setCustomProfile(parsed as MockHealthProfile);
          setStatusMessage(`✅ Successfully imported and visualized ${file.name}`);
        } else if (parsed.vitals) {
          const customGenerated: MockHealthProfile = {
            ...MOCK_HEALTH_PROFILES[5],
            title: `Imported: ${file.name}`,
            subtitle: `Custom JSON Ingested Telemetry`,
            vitals: parsed.vitals,
            visualAnalytics: {
              ...MOCK_HEALTH_PROFILES[5].visualAnalytics,
              healthScore: parsed.vitals.sleepScore || 82,
              heartRateAvg: `${parsed.vitals.currentHeartRate || 72}bpm`,
              stepsAvg: (parsed.vitals.steps || 7500).toLocaleString(),
              sleepAvg: parsed.vitals.sleepDuration || '7.40h'
            }
          };
          setCustomProfile(customGenerated);
          setStatusMessage(`✅ Successfully parsed vitals from ${file.name}`);
        } else {
          setStatusMessage(`✅ Ingested JSON telemetry from ${file.name}`);
        }
      } catch {
        setStatusMessage(`⚠️ Could not parse JSON file format.`);
      }
      setTimeout(() => setStatusMessage(null), 5000);
    };
    reader.readAsText(file);
  };

  // Download active JSON dataset
  const handleDownloadActiveJson = async () => {
    try {
      const dataStr = JSON.stringify(activeProfile, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeProfile.profileId || 'telemetry_dataset'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  // 4 rows x 7 cols of wellness heatmap
  const heatmapData = [
    [0.2, 0.4, 0.6, 0.3, 0.5, 0.7, 0.4],
    [0.8, 0.3, 0.4, 0.9, 0.6, 0.4, 0.5],
    [0.9, 0.5, 0.3, 0.7, 0.4, 0.8, 0.6],
    [0.4, 0.6, 0.8, 0.3, 0.5, 0.2, 0.7]
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      width: '100%',
      maxWidth: '1600px',
      margin: '0 auto',
      fontFamily: '"Times New Roman", Times, serif'
    }}>
      {/* 0. Telemetry Dataset & JSON Sync Ribbon */}
      <div style={{
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdfa 100%)',
        borderRadius: '18px',
        border: '1px solid #bae6fd',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 2px 10px rgba(2, 132, 199, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: '#ffffff',
            border: '1px solid #bae6fd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0284c7'
          }}>
            <Activity size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                {t('analytics_dataset_switcher', 'Active Telemetry Feed')}: <b style={{ color: '#0284c7' }}>{activeProfile.title}</b>
              </span>
              <span style={{
                fontSize: '9.5px',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: '6px',
                background: activeProfile.badge.bg,
                color: activeProfile.badge.color,
                border: `1px solid ${activeProfile.badge.border}`
              }}>
                {activeProfile.badge.label}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {translateText('Patient')}: <b>{activeProfile.patient.name}</b> ({activeProfile.patient.age}y {activeProfile.patient.gender}) • {activeProfile.device.name} • {activeProfile.observationCount.toLocaleString()} Records
            </div>
          </div>
        </div>

        {/* Action Controls: Profile Selector Dropdown + Direct Upload + Download */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Profile Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '9px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
              }}
            >
              <Zap size={13} color="#0284c7" />
              <span>{t('analytics_dataset_switcher', 'Select Dataset Profile')}</span>
              <ChevronDown size={13} color="#64748b" />
            </button>

            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '38px',
                right: 0,
                width: '320px',
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                zIndex: 50,
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                {MOCK_HEALTH_PROFILES.map((p) => {
                  const isSelected = p.profileId === activeProfile.profileId;
                  return (
                    <div
                      key={p.profileId}
                      onClick={() => handleSelectProfile(p.profileId)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: isSelected ? '#f0f9ff' : 'transparent',
                        border: isSelected ? '1px solid #bae6fd' : '1px solid transparent',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: isSelected ? '#0284c7' : '#0f172a' }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>
                          {p.patient.name} ({p.patient.age}y) • {p.vitals.currentHeartRate} BPM
                        </div>
                      </div>
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: p.badge.bg,
                        color: p.badge.color
                      }}>
                        {p.badge.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Direct JSON File Uploader */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleDirectJsonUpload}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload custom JSON telemetry file"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: '9px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}
          >
            <Upload size={13} color="#0284c7" />
            <span>{translateText('Upload JSON')}</span>
          </button>

          {/* Download Active JSON Button */}
          <button
            onClick={handleDownloadActiveJson}
            title="Download active dataset JSON"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: '9px',
              background: '#0284c7',
              border: 'none',
              color: '#ffffff',
              fontSize: '11.5px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(2,132,199,0.3)'
            }}
          >
            <Download size={13} />
            <span>{translateText('Download JSON')}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div style={{
          padding: '10px 16px',
          borderRadius: '12px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
          fontSize: '12px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} color="#16a34a" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* TOP ROW: Chat with Synapse Hero (Left) + Wellness / Quick Access (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '20px'
      }}>
        {/* 1. Chat with SYNAPSE Hero Card (7 cols) */}
        <div style={{
          gridColumn: 'span 7',
          background: 'linear-gradient(135deg, #f0fdfa 0%, #fce7f3 50%, #fdf2f8 100%)',
          borderRadius: '28px',
          border: '1px solid #fbcfe8',
          padding: '28px',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '340px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 10px 30px rgba(219, 39, 119,0.06)'
        }}>
          {/* 3D DNA Helix Background Graphic */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '55%',
            height: '100%',
            backgroundImage: 'url(/images/3d_dna_synapse.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.85,
            mixBlendMode: 'multiply',
            pointerEvents: 'none'
          }} />

          {/* Top Tag & Header */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{
              display: 'inline-block',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.05em',
              padding: '4px 10px',
              borderRadius: '8px',
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              marginBottom: '16px'
            }}>
              {translateText('AI DOCTOR')}
            </span>

            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>{translateText('Chat with')}</div>
            <h2 style={{
              fontSize: '34px',
              fontWeight: 900,
              color: '#0f172a',
              margin: '2px 0 0 0',
              letterSpacing: '-0.03em'
            }}>
              {translateText('SYNAPSE')}
            </h2>
          </div>

          {/* Bottom Prompt Chips & Input Field */}
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '460px' }}>
            {/* Quick Suggestion Chips */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => handleOpenSynapseOSAI('How can I improve my sleep?')}
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '6px 14px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#1e293b',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f9a8d4'; e.currentTarget.style.color = '#db2777'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#1e293b'; }}
              >
                💬 {translateText('How can I improve my sleep?')}
              </button>
              <button 
                onClick={() => handleOpenSynapseOSAI('Analyze my latest ECG telemetry')}
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '6px 14px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#1e293b',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f9a8d4'; e.currentTarget.style.color = '#db2777'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#1e293b'; }}
              >
                ⚡ {translateText('Analyze my latest ECG telemetry')}
              </button>
            </div>

            {/* Input Bar */}
            <div 
              onClick={() => handleOpenSynapseOSAI(chatMessage)}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#ffffff',
                borderRadius: '9999px',
                padding: '6px 8px 6px 16px',
                border: '1.5px solid #cbd5e1',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                cursor: 'pointer'
              }}
            >
              <input
                type="text"
                placeholder={translateText('Ask your health coach...')}
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleOpenSynapseOSAI(chatMessage);
                  }
                }}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '13px',
                  color: '#0f172a',
                  background: 'transparent',
                  cursor: 'text'
                }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenSynapseOSAI(chatMessage);
                }}
                title="Open SynapseOS AI Assistant"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
                  transition: 'transform 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Sparkles size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Right Side: Wellness Progress (Top) + Records/Appointments (Bottom) (5 cols) */}
        <div style={{
          gridColumn: 'span 5',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Wellness Progress Heatmap Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '28px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            display: 'flex',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0' }}>
                {translateText('Wellness Progress')}
              </h3>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 20px 0' }}>
                {translateText('View your monthly progress at a glance')}
              </p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{translateText('Your Health Score:')}</span>
                <span style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a' }}>
                  {activeProfile.visualAnalytics.healthScore}%
                </span>
              </div>
            </div>

            {/* Heatmap Grid & Next Appt Info */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {heatmapData.map((row, rIdx) => (
                  <div key={rIdx} style={{ display: 'flex', gap: '5px' }}>
                    {row.map((val, cIdx) => (
                      <div
                        key={cIdx}
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '5px',
                          background: val > 0.7 ? '#818cf8' : val > 0.4 ? '#fbcfe8' : val > 0.2 ? '#fecaca' : '#fee2e2',
                          opacity: 0.9
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>{translateText('Next Appointment:')}</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                    {translateText(activeProfile.visualAnalytics.nextAppointment.date)}
                  </div>
                </div>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0f172a',
                  cursor: 'pointer'
                }}>
                  <ArrowUpRight size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access Two Cards: My Records & Appointments (with COMING SOON BADGE) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* My Records - COMING SOON */}
            <div 
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                border: '1px solid #e2e8f0',
                padding: '20px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{translateText('My Records')}</h4>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#db2777', background: '#fdf2f8', padding: '1px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>
                    {translateText('Coming Soon')}
                  </span>
                </div>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowUpRight size={14} color="#64748b" />
                </div>
              </div>
              <div style={{
                marginTop: '16px',
                height: '70px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#db2777'
              }}>
                <Folder size={32} />
              </div>
            </div>

            {/* Appointments - COMING SOON */}
            <div 
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                border: '1px solid #e2e8f0',
                padding: '20px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{translateText('Appointments')}</h4>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#4f46e5', background: '#e0e7ff', padding: '1px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>
                    {translateText('Coming Soon')}
                  </span>
                </div>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowUpRight size={14} color="#64748b" />
                </div>
              </div>
              <div style={{
                marginTop: '16px',
                height: '70px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #e0e7ff 0%, #fbcfe8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4f46e5'
              }}>
                <CalendarIcon size={32} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE ROW: 4 Sexy Vitals Graph Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px'
      }}>
        {/* Card 1: Heart Rate (Spline Chart) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          padding: '20px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                background: '#f3e8ff',
                color: '#a855f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Heart size={18} fill="#a855f7" />
              </div>
              <MoreVertical size={16} color="#94a3b8" style={{ cursor: 'pointer' }} />
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0' }}>{translateText('Heart Rate')}</h4>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {translateText('The average heart rate is')}{' '}
              <strong style={{ color: '#0f172a', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                {activeProfile.visualAnalytics.heartRateAvg}
              </strong>
            </div>
          </div>

          {/* Dynamic Spline Chart */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ height: '60px', width: '100%', position: 'relative' }}>
              <svg viewBox="0 0 240 60" style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                <defs>
                  <linearGradient id="hrCardGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Gradient area under the curve */}
                <path
                  d="M 0 42 C 35 15, 65 50, 95 24 C 125 8, 155 44, 185 20 C 205 8, 225 32, 240 18 L 240 60 L 0 60 Z"
                  fill="url(#hrCardGrad)"
                />
                {/* Smooth wave stroke */}
                <path
                  d="M 0 42 C 35 15, 65 50, 95 24 C 125 8, 155 44, 185 20 C 205 8, 225 32, 240 18"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Active telemetry pulse dot */}
                <circle cx="240" cy="18" r="4" fill="#a855f7" stroke="#ffffff" strokeWidth="2" />
              </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8', fontWeight: 700, marginTop: '8px', padding: '0 2px' }}>
              <span>10:00 AM</span>
              <span>11:00 AM</span>
              <span>12:00 PM</span>
              <span>01:00 PM</span>
            </div>
          </div>
        </div>

        {/* Card 2: Sleep Score (Bar Chart) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          padding: '20px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                background: '#ede9fe',
                color: '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Moon size={18} fill="#6366f1" />
              </div>
              <MoreVertical size={16} color="#94a3b8" style={{ cursor: 'pointer' }} />
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0' }}>{translateText('Sleep Score')}</h4>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {translateText('The average sleep is')}{' '}
              <strong style={{ color: '#0f172a', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                {activeProfile.visualAnalytics.sleepAvg}
              </strong>
            </div>
          </div>

          {/* Bar Chart */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ height: '60px', display: 'flex', alignItems: 'flex-end', gap: '6px', justifyContent: 'space-between' }}>
              {activeProfile.visualAnalytics.sleepBars.map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${Math.max(25, h)}%`,
                    borderRadius: '6px',
                    background: i === 5 || i === 3 
                      ? 'linear-gradient(180deg, #818cf8 0%, #a855f7 100%)' 
                      : 'linear-gradient(180deg, #c4b5fd 0%, #e9d5ff 100%)',
                    transition: 'height 0.4s ease'
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8', fontWeight: 700, marginTop: '8px', padding: '0 2px' }}>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* Card 3: Stress Balance (Scatter / Line Chart) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          padding: '20px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                background: '#ede9fe',
                color: '#8b5cf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Brain size={18} />
              </div>
              <MoreVertical size={16} color="#94a3b8" style={{ cursor: 'pointer' }} />
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0' }}>{translateText('Stress Balance')}</h4>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {translateText('Your average stress is')}{' '}
              <strong style={{ color: '#0f172a', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                {activeProfile.visualAnalytics.stressAvg}
              </strong>
            </div>
          </div>

          {/* Scatter Line Chart */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ height: '60px', width: '100%', position: 'relative' }}>
              <svg viewBox="0 0 240 60" style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                <defs>
                  <linearGradient id="stressCardGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 38 C 40 48, 80 18, 120 34 C 160 48, 200 16, 240 28 L 240 60 L 0 60 Z"
                  fill="url(#stressCardGrad)"
                />
                <path
                  d="M 0 38 C 40 48, 80 18, 120 34 C 160 48, 200 16, 240 28"
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="1.8"
                  strokeDasharray="4 4"
                />
                {/* Highlighted Scatter Dots */}
                <circle cx="35" cy="44" r="3.5" fill="#818cf8" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="75" cy="22" r="3.5" fill="#818cf8" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="120" cy="34" r="3.5" fill="#818cf8" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="165" cy="46" r="3.5" fill="#818cf8" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="205" cy="18" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="235" cy="28" r="3.5" fill="#818cf8" stroke="#ffffff" strokeWidth="1.5" />
              </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8', fontWeight: 700, marginTop: '8px', padding: '0 2px' }}>
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>
          </div>
        </div>

        {/* Card 4: Weekly Steps (Multi-Bar Gradient Chart) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          padding: '20px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                background: '#e0e7ff',
                color: '#4338ca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Footprints size={18} />
              </div>
              <MoreVertical size={16} color="#94a3b8" style={{ cursor: 'pointer' }} />
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0' }}>{translateText('Weekly Steps')}</h4>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {translateText('Your average steps is')}{' '}
              <strong style={{ color: '#0f172a', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                {activeProfile.visualAnalytics.stepsAvg}
              </strong>
            </div>
          </div>

          {/* Multi-Bar Gradient Chart */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ height: '60px', display: 'flex', alignItems: 'flex-end', gap: '6px', justifyContent: 'space-between' }}>
              {activeProfile.visualAnalytics.stepsBars.map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${Math.max(25, h)}%`,
                    borderRadius: '6px',
                    background: i === 4 || i === 2 
                      ? 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)' 
                      : 'linear-gradient(180deg, #bae6fd 0%, #e0f2fe 100%)',
                    transition: 'height 0.4s ease'
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8', fontWeight: 700, marginTop: '8px', padding: '0 2px' }}>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Actionable Insights, Care Plan, and Next Checkup */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '20px'
      }}>
        {/* 1. AI Insights (5 cols) */}
        <div style={{
          gridColumn: 'span 5',
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{translateText('AI Insights')}</h4>
              <span style={{ fontSize: '11px', color: '#64748b' }}>{translateText('Personalized insights for you')}</span>
            </div>
            <MoreVertical size={16} color="#94a3b8" style={{ cursor: 'pointer' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' }}>
                {translateText('POSITIVE')}
              </span>
              <h5 style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', margin: '8px 0 2px 0' }}>
                {translateText(activeProfile.visualAnalytics.insights.positive.title)}
              </h5>
              <p style={{ fontSize: '10px', color: '#64748b', margin: 0, lineHeight: 1.3 }}>
                {translateText(activeProfile.visualAnalytics.insights.positive.desc)}
              </p>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#d97706', background: '#fffbeb', padding: '2px 6px', borderRadius: '4px' }}>
                {translateText('TAKE ACTION')}
              </span>
              <h5 style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', margin: '8px 0 2px 0' }}>
                {translateText(activeProfile.visualAnalytics.insights.action.title)}
              </h5>
              <p style={{ fontSize: '10px', color: '#64748b', margin: 0, lineHeight: 1.3 }}>
                {translateText(activeProfile.visualAnalytics.insights.action.desc)}
              </p>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#ef4444', background: '#fef2f2', padding: '2px 6px', borderRadius: '4px' }}>
                {translateText('MONITOR')}
              </span>
              <h5 style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', margin: '8px 0 2px 0' }}>
                {translateText(activeProfile.visualAnalytics.insights.monitor.title)}
              </h5>
              <p style={{ fontSize: '10px', color: '#64748b', margin: 0, lineHeight: 1.3 }}>
                {translateText(activeProfile.visualAnalytics.insights.monitor.desc)}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Care Plan (4 cols) */}
        <div style={{
          gridColumn: 'span 4',
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.02)'
        }}>
          <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>{translateText('Care Plan')}</h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '10px 14px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pill size={16} color="#0f172a" />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                    {translateText(activeProfile.visualAnalytics.carePlan.medication.title)}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    {translateText(activeProfile.visualAnalytics.carePlan.medication.desc)}
                  </div>
                </div>
              </div>
              {activeProfile.visualAnalytics.carePlan.medication.completed ? (
                <CheckCircle2 size={18} color="#059669" />
              ) : (
                <Clock size={18} color="#d97706" />
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '10px 14px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Droplets size={16} color="#db2777" />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                    {translateText(activeProfile.visualAnalytics.carePlan.hydration.title)}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    {translateText(activeProfile.visualAnalytics.carePlan.hydration.desc)}
                  </div>
                </div>
              </div>
              <div style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#db2777',
                background: '#fdf2f8',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid #fbcfe8'
              }}>
                {activeProfile.visualAnalytics.carePlan.hydration.progress}%
              </div>
            </div>
          </div>
        </div>

        {/* 3. Next Checkup (3 cols) */}
        <div style={{
          gridColumn: 'span 3',
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          padding: '20px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {translateText('Next Checkups')}
              </h4>
              <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                {translateText('Scheduled ABDM Consultations')}
              </span>
            </div>
            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              color: '#0284c7',
              background: '#e0f2fe',
              padding: '2px 8px',
              borderRadius: '999px',
              border: '1px solid #bae6fd'
            }}>
              {(activeProfile.visualAnalytics.upcomingAppointments || [activeProfile.visualAnalytics.nextAppointment]).length} {translateText('Scheduled')}
            </span>
          </div>

          {/* Appointments List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(activeProfile.visualAnalytics.upcomingAppointments || [activeProfile.visualAnalytics.nextAppointment]).map((appt, idx) => {
              // Dynamic gradient based on doctor initials
              const gradients = [
                'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                'linear-gradient(135deg, #059669 0%, #047857 100%)',
                'linear-gradient(135deg, #db2777 0%, #be185d 100%)',
                'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)'
              ];
              const initials = appt.initials || appt.doctor.split(' ').map(n => n[0]).filter(Boolean).slice(-2).join('').toUpperCase() || 'DR';
              const gradIndex = idx % gradients.length;

              return (
                <div 
                  key={idx}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    background: '#f8fafc', 
                    padding: '9px 12px', 
                    borderRadius: '14px', 
                    border: '1px solid #f1f5f9',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Doctor Initials Avatar Badge */}
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '11px',
                    background: gradients[gradIndex],
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    letterSpacing: '0.5px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    flexShrink: 0
                  }}>
                    {initials}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {translateText(appt.doctor)}
                      </span>
                      {appt.mode && (
                        <span style={{
                          fontSize: '8.5px',
                          fontWeight: 800,
                          color: appt.mode === 'Teleconsultation' ? '#0284c7' : appt.mode === 'In-Clinic' ? '#059669' : '#7c3aed',
                          background: appt.mode === 'Teleconsultation' ? '#e0f2fe' : appt.mode === 'In-Clinic' ? '#ecfdf5' : '#f5f3ff',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          whiteSpace: 'nowrap'
                        }}>
                          {translateText(appt.mode)}
                        </span>
                      )}
                    </div>
                    
                    <div style={{ fontSize: '10px', color: '#64748b', margin: '2px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CalendarIcon size={10} color="#94a3b8" />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {translateText(appt.date)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: '#ffffff',
                        color: appt.color || '#0284c7',
                        border: '1px solid #e2e8f0',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%'
                      }}>
                        {translateText(appt.type)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
