'use client';

import React, { useState, useRef } from 'react';
import { 
  MOCK_HEALTH_PROFILES, 
  MockHealthProfile, 
  mausamKarProfile 
} from '@/data/mockHealthProfiles';
import { 
  WorkspaceHeader, 
  InboxPanel, 
  ChatCanvas, 
  DossierPanel, 
  WorkspaceStateProps 
} from '../workspace';
import SettingsDrawer from './SettingsDrawer';
import WhatsAppBridgeModal from './WhatsAppBridgeModal';
import VoiceModeOverlay from './VoiceModeOverlay';
import { X } from 'lucide-react';

export default function FullScreenWorkspace({
  activeProfileId,
  onSelectProfile,
  assistantPersona,
  onPersonaChange,
  selectedModel,
  setSelectedModel,
  selectedLanguage,
  onLanguageChange,
  messages = [],
  loading = false,
  copiedId = null,
  messagesEndRef,
  inputRef,
  input = '',
  setInput,
  isListening = false,
  callActive = false,
  isVoiceMode = false,
  voiceState = 'listening',
  liveTranscript = '',
  aiSpeechText = '',
  isMuted = false,
  toggleMute = () => {},
  exitVoiceMode = () => {},
  onSend,
  onToggleVoice,
  onCopy,
  onNewChat,
  onClose,
  onToggleFullscreen,
  sessions = [],
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  geminiApiKey = '',
  setGeminiApiKey = () => {},
  groqApiKey = '',
  setGroqApiKey = () => {},
  showKeyText = false,
  setShowKeyText = () => {},
  vapiPublicKey = '',
  setVapiPublicKey = () => {},
  vapiAssistantId = '',
  setVapiAssistantId = () => {},
  backendUrl = '',
  setBackendUrl = () => {},
  saveCredentials = () => {},
  waPhoneNumber = '',
  setWaPhoneNumber = () => {},
  waConnected = false,
  waMetaToken = '',
  setWaMetaToken = () => {},
  waWebhookUrl = '',
  setWaWebhookUrl = () => {},
  waAutoSyncReports = false,
  setWaAutoSyncReports = () => {},
  waDailyReminders = false,
  setWaDailyReminders = () => {},
  handleSaveWhatsApp = () => {},
  handleSimulateWhatsAppMessage = () => {},
  setMessages = () => {}
}: WorkspaceStateProps) {
  const [customProfiles, setCustomProfiles] = useState<MockHealthProfile[]>([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allProfiles = [...customProfiles, ...MOCK_HEALTH_PROFILES];
  const currentProfile = allProfiles.find(p => p.profileId === activeProfileId) || allProfiles[0] || mausamKarProfile;

  // Custom JSON Dossier File Upload Handler
  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        const newProfile: MockHealthProfile = {
          profileId: parsed.profileId || `custom_${Date.now()}`,
          title: parsed.title || parsed.patient?.name || 'Custom Uploaded Patient',
          subtitle: parsed.subtitle || `ABHA: ${parsed.patient?.abhaId || 'ABDM-VERIFIED'} • Custom Dossier`,
          jsonPath: '',
          badge: parsed.badge || { label: 'Custom Patient', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
          patient: {
            name: parsed.patient?.name || parsed.name || 'Uploaded Patient',
            age: parsed.patient?.age || parsed.age || 28,
            gender: parsed.patient?.gender || parsed.gender || 'Unknown',
            bloodType: parsed.patient?.bloodType || parsed.bloodType || 'B+',
            abhaId: parsed.patient?.abhaId || parsed.abhaId || `91-7294-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
            policyNumber: parsed.patient?.policyNumber || 'PM-JAY-CUSTOM'
          },
          device: parsed.device || { name: 'Connected Wearable', brand: 'apple', firmware: 'ABDM-Bridge v4.2', battery: 92 },
          observationCount: parsed.observationCount || 1500,
          vitals: {
            steps: parsed.vitals?.steps || 9200,
            stepGoal: parsed.vitals?.stepGoal || 10000,
            restingHeartRate: parsed.vitals?.restingHeartRate || 64,
            currentHeartRate: parsed.vitals?.currentHeartRate || 72,
            hrvMs: parsed.vitals?.hrvMs || 65,
            spo2: parsed.vitals?.spo2 || 98.4,
            vo2Max: parsed.vitals?.vo2Max || 46.0,
            respiratoryRate: parsed.vitals?.respiratoryRate || 16,
            activeCalories: parsed.vitals?.activeCalories || 620,
            calorieGoal: parsed.vitals?.calorieGoal || 600,
            sleepScore: parsed.vitals?.sleepScore || 88,
            sleepDuration: parsed.vitals?.sleepDuration || '7h 40m',
            sleepStages: parsed.vitals?.sleepStages || { deep: '2h', rem: '1.5h', light: '4h', awake: '20m' },
            bloodGlucose: parsed.vitals?.bloodGlucose || 92,
            bloodPressure: parsed.vitals?.bloodPressure || '118/76 mmHg',
            wristTempDeviation: parsed.vitals?.wristTempDeviation || '0.0°F'
          },
          visualAnalytics: parsed.visualAnalytics || mausamKarProfile.visualAnalytics,
          ecgStatus: parsed.ecgStatus || 'Normal Sinus Rhythm (HR 72 BPM)',
          aiAnalysis: parsed.aiAnalysis || { type: 'optimal', title: 'Custom Dossier Active', description: 'Patient records uploaded and verified.' }
        };
        setCustomProfiles(prev => [newProfile, ...prev]);
        onSelectProfile(newProfile.profileId);
      } catch (err) {
        alert('Invalid JSON file format. Please upload a valid SynapseOS patient dossier JSON.');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="synapseos-root" style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      height: '100vh',
      background: '#f8fafc',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#0f172a',
      overflow: 'hidden',
      position: 'fixed',
      inset: 0,
      zIndex: 2147483647
    }}>
      {/* Hidden File Input for Custom Patient JSON Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleJsonUpload}
        accept=".json"
        style={{ display: 'none' }}
      />

      {/* ─── 1. TOP GLOBAL APPLICATION BAR ─────────────────────────── */}
      <WorkspaceHeader
        currentProfile={currentProfile}
        allProfiles={allProfiles}
        onSelectProfile={onSelectProfile}
        onUploadJsonClick={() => fileInputRef.current?.click()}
        onNewChat={onNewChat}
        onOpenWhatsApp={() => setShowWhatsAppModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onToggleFullscreen={onToggleFullscreen}
        onClose={onClose}
        selectedLanguage={selectedLanguage}
        onLanguageChange={onLanguageChange}
        callActive={callActive}
        isListening={isListening}
        onToggleVoice={onToggleVoice}
        waConnected={waConnected}
      />

      {/* ─── 2. 3-COLUMN WORKSPACE BODY ─────────────────────────────── */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flex: 1,
        minHeight: 0,
        height: 'calc(100vh - 60px)',
        width: '100vw',
        overflow: 'hidden'
      }}>
        {/* Left Column: Channels & Conversation History (260px) */}
        <InboxPanel
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={onSelectSession}
          onDeleteSession={onDeleteSession}
          onNewChat={onNewChat}
          selectedLanguage={selectedLanguage}
        />

        {/* Center Column: Full Interactive Chat Canvas */}
        <ChatCanvas
          currentProfile={currentProfile}
          assistantPersona={assistantPersona}
          onPersonaChange={onPersonaChange}
          messages={messages}
          loading={loading}
          copiedId={copiedId}
          messagesEndRef={messagesEndRef}
          inputRef={inputRef}
          input={input}
          setInput={setInput}
          isListening={isListening}
          callActive={callActive}
          onSend={onSend}
          onToggleVoice={onToggleVoice}
          onCopy={onCopy}
          onNewChat={onNewChat}
          selectedLanguage={selectedLanguage}
          onLanguageChange={onLanguageChange}
          onOpenWhatsApp={() => setShowWhatsAppModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
          onToggleFullscreen={onToggleFullscreen}
          onClose={onClose}
        />

        {/* Right Column: Patient Dossier & Sub-Agents (320px) */}
        <DossierPanel
          currentProfile={currentProfile}
          onTriggerAgentQuery={onSend}
          selectedLanguage={selectedLanguage}
        />
      </div>

      {/* Live AI Voice Mode Overlay in Fullscreen */}
      {isVoiceMode && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(12px)',
          zIndex: 100000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '460px',
            maxWidth: '92vw',
            height: '560px',
            maxHeight: '90vh',
            background: '#ffffff',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}>
            <VoiceModeOverlay
              persona={assistantPersona}
              voiceState={voiceState}
              transcript={liveTranscript}
              aiResponseText={aiSpeechText}
              isMuted={isMuted}
              onToggleMute={toggleMute}
              onExitVoice={exitVoiceMode}
            />
          </div>
        </div>
      )}

      {/* Settings Modal Overlay */}
      {showSettingsModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} onClick={() => setShowSettingsModal(false)}>
          <div style={{
            width: '460px',
            maxWidth: '92vw',
            maxHeight: '88vh',
            background: '#ffffff',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>AI Engine & API Settings</span>
              <button onClick={() => setShowSettingsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }} className="synapseos-custom-scroll">
              <SettingsDrawer
                assistantPersona={assistantPersona}
                onPersonaChange={onPersonaChange}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                selectedLanguage={selectedLanguage}
                onLanguageChange={onLanguageChange}
                geminiApiKey={geminiApiKey}
                setGeminiApiKey={setGeminiApiKey}
                groqApiKey={groqApiKey}
                setGroqApiKey={setGroqApiKey}
                showKeyText={showKeyText}
                setShowKeyText={setShowKeyText}
                vapiPublicKey={vapiPublicKey}
                setVapiPublicKey={setVapiPublicKey}
                vapiAssistantId={vapiAssistantId}
                setVapiAssistantId={setVapiAssistantId}
                backendUrl={backendUrl}
                setBackendUrl={setBackendUrl}
                onSaveCredentials={saveCredentials}
                onClearHistory={() => {
                  setMessages([]);
                  setShowSettingsModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal Overlay */}
      {showWhatsAppModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} onClick={() => setShowWhatsAppModal(false)}>
          <div style={{
            width: '460px',
            maxWidth: '92vw',
            maxHeight: '88vh',
            background: '#ffffff',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>WhatsApp Multi-Channel Bridge</span>
              <button onClick={() => setShowWhatsAppModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }} className="synapseos-custom-scroll">
              <WhatsAppBridgeModal
                waPhoneNumber={waPhoneNumber}
                setWaPhoneNumber={setWaPhoneNumber}
                waConnected={waConnected}
                waMetaToken={waMetaToken}
                setWaMetaToken={setWaMetaToken}
                waWebhookUrl={waWebhookUrl}
                setWaWebhookUrl={setWaWebhookUrl}
                waAutoSyncReports={waAutoSyncReports}
                setWaAutoSyncReports={setWaAutoSyncReports}
                waDailyReminders={waDailyReminders}
                setWaDailyReminders={setWaDailyReminders}
                onSaveWhatsApp={handleSaveWhatsApp}
                onSimulateInbound={handleSimulateWhatsAppMessage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
