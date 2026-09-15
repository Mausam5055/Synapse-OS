'use client';

import React, { useState } from 'react';
import { Fingerprint, FileCheck2, Link as LinkIcon, ShieldCheck, Download, CheckCircle2, Wallet, AlertCircle, Zap, ChevronDown } from 'lucide-react';
import { useBlockchainRecords, UseBlockchainRecordsProps } from './useBlockchainRecords';
import AbhaGenerator from './AbhaGenerator';
import RecordsList from './RecordsList';
import VaccinationTracker from './VaccinationTracker';
import { MOCK_HEALTH_PROFILES } from '@/data/mockHealthProfiles';
import { useLanguage } from '@/context/LanguageContext';

export default function BlockchainRecordsPanel({
  patient,
  activeProfile,
  selectedProfileId,
  onSelectProfile
}: UseBlockchainRecordsProps) {
  const state = useBlockchainRecords({ patient, activeProfile, selectedProfileId, onSelectProfile });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { t, translateText } = useLanguage();

  const activeMatchedProfile = MOCK_HEALTH_PROFILES.find(p => p.profileId === state.currentProfileId) || MOCK_HEALTH_PROFILES[0];

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: '"Times New Roman", Times, serif'
    }}>
      
      {/* 0. Telemetry Dataset & Citizen ABHA Profile Switcher Ribbon */}
      <div style={{
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #eff6ff 100%)',
        borderRadius: '18px',
        border: '1px solid #fbcfe8',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 2px 10px rgba(219, 39, 119, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#ffffff',
            border: '1px solid #fbcfe8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#db2777'
          }}>
            <Fingerprint size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a' }}>
                {t('active_citizen_label', 'Active ABDM Citizen')}: <b style={{ color: '#db2777' }}>{state.name}</b>
              </span>
              <span style={{
                fontSize: '9.5px',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: '6px',
                background: activeMatchedProfile.badge.bg,
                color: activeMatchedProfile.badge.color,
                border: `1px solid ${activeMatchedProfile.badge.border}`
              }}>
                {translateText(activeMatchedProfile.badge.label)}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              ABHA: <b style={{ color: '#0f172a' }}>{state.abhaData?.abha_number || activeMatchedProfile.patient.abhaId}</b> • {translateText('DOB:')} <b>{translateText(state.dob || activeMatchedProfile.patient.dob || '2002')}</b> • {translateText('YOB:')} <b>{state.yearOfBirth}</b>
            </div>
          </div>
        </div>

        {/* Profile Dropdown Selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '10px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}
          >
            <Zap size={13} color="#db2777" />
            <span>{t('select_citizen_btn', 'Select Citizen (My Condition)')}</span>
            <ChevronDown size={13} color="#64748b" />
          </button>

          {isDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '40px',
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
                const isSelected = p.profileId === state.currentProfileId;
                return (
                  <div
                    key={p.profileId}
                    onClick={() => {
                      state.handleSwitchProfile(p.profileId);
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: isSelected ? '#fdf2f8' : 'transparent',
                      border: isSelected ? '1px solid #fbcfe8' : '1px solid transparent',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: isSelected ? '#db2777' : '#0f172a' }}>
                        {p.patient.name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>
                        DOB: {p.patient.dob || '2002'} • {p.patient.abhaId}
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
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
            {t('records_title', 'Health Records & Blockchain Passport')}
          </h1>
          <p style={{ color: '#64748b', fontSize: '13.5px', margin: '4px 0 0 0' }}>
            {t('records_subtitle', 'ABDM Integration • Cryptographic Verification • Decentralized Registry')}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {state.walletError && (
            <span style={{ 
              fontSize: '11px', 
              color: '#e11d48', 
              fontWeight: 600, 
              background: '#fff1f2', 
              padding: '4px 10px', 
              borderRadius: '8px', 
              border: '1px solid #fecdd3',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <AlertCircle size={12} />
              {state.walletError}
            </span>
          )}
          
          <button
            onClick={state.connectBurner}
            disabled={state.connecting}
            title="Use built-in local simulation burner wallet"
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              background: state.walletMode === 'burner' && state.walletAddress ? '#f1f5f9' : '#ffffff',
              border: state.walletMode === 'burner' && state.walletAddress ? '1.5px solid #64748b' : '1px solid #cbd5e1',
              color: state.walletMode === 'burner' && state.walletAddress ? '#0f172a' : '#64748b',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <Wallet size={12} />
            Burner {state.walletMode === 'burner' && state.walletAddress ? '✓' : ''}
          </button>
          
          <button
            onClick={state.connectMetaMask}
            disabled={state.connecting}
            title="Connect your browser MetaMask wallet"
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              background: state.walletMode === 'metamask' && state.walletAddress ? '#fff7ed' : '#ffffff',
              border: state.walletMode === 'metamask' && state.walletAddress ? '1.5px solid #f97316' : '1px solid #cbd5e1',
              color: state.walletMode === 'metamask' && state.walletAddress ? '#ea580c' : '#f5841f',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: state.walletMode === 'metamask' && state.walletAddress ? '0 0 10px rgba(249, 115, 22, 0.2)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            🦊 MetaMask {state.walletMode === 'metamask' && state.walletAddress ? '✓' : ''}
          </button>

          <span style={{ 
            padding: '6px 14px', 
            borderRadius: '9999px', 
            background: state.contractOk ? '#ecfdf5' : '#eff6ff', 
            border: `1px solid ${state.contractOk ? '#a7f3d0' : '#bfdbfe'}`, 
            color: state.contractOk ? '#059669' : '#2563eb', 
            fontSize: '11px', 
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {state.contractOk ? <CheckCircle2 size={12} /> : <Zap size={12} />}
            {state.networkName === 'sepolia' 
              ? (state.contractOk ? translateText('Sepolia Testnet Active') : translateText('Sepolia RPC Ready')) 
              : (state.contractOk ? translateText('Hardhat Ready') : translateText('Node Offline'))}
          </span>
          
          {state.walletAddress && (
            <span style={{ 
              fontSize: '11px', 
              color: '#334155', 
              fontWeight: 700, 
              fontFamily: 'monospace',
              background: '#f8fafc',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0'
            }}>
              {state.walletAddress.slice(0, 6)}...{state.walletAddress.slice(-4)}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        flexWrap: 'wrap', 
        background: '#ffffff', 
        border: '1px solid #e2e8f0', 
        padding: '12px 18px', 
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
      }}>
        {[
          { id: 'abha', labelKey: 'tab_national_abha', defaultLabel: 'National ABHA ID', icon: Fingerprint },
          { id: 'vaccination', labelKey: 'tab_vaccination_uwin', defaultLabel: translateText('💉 Immunization & U-WIN'), icon: ShieldCheck },
          { id: 'passport', labelKey: 'tab_qr_passport', defaultLabel: 'QR Health Passport', icon: FileCheck2 },
          { id: 'blockchain', labelKey: 'tab_onchain_records', defaultLabel: 'On-Chain Records', icon: LinkIcon },
          { id: 'verify', labelKey: 'tab_verify_integrity', defaultLabel: 'Verify Integrity', icon: ShieldCheck }
        ].map(item => {
          const label = t(item.labelKey, translateText(item.defaultLabel));
          return (
            <button
              key={item.id}
              onClick={() => state.setActiveTab(item.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '10px',
                backgroundColor: state.activeTab === item.id ? '#db2777' : '#f8fafc',
                color: state.activeTab === item.id ? '#ffffff' : '#64748b',
                border: '1px solid ' + (state.activeTab === item.id ? '#be185d' : '#e2e8f0'),
                cursor: 'pointer',
                fontWeight: state.activeTab === item.id ? 800 : 600,
                fontSize: '12px',
                transition: 'all 0.15s ease'
              }}
            >
              <item.icon size={14} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
        
        {state.activeTab === 'abha' && <AbhaGenerator state={state} />}

        {state.activeTab === 'vaccination' && (
          <VaccinationTracker patientName={state.name} abhaId={state.abhaData?.abha_number || activeMatchedProfile.patient.abhaId} />
        )}
        
        {state.activeTab === 'passport' && (
          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '8px', color: '#0f172a', fontWeight: 800 }}>
              {t('tab_qr_passport', 'Verifiable Digital Health Passport')}
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
              {translateText(`Compiles clinical triage results, vital trends, active prescriptions, and cryptographic QR signature for ${state.name} into a single downloadable PDF.`)}
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 16px 0', color: '#db2777', fontWeight: 800 }}>
                {t('passport_payload_title', 'Included Clinical Payload')}:
              </h4>
              <ul style={{ color: '#334155', fontSize: '14px', lineHeight: '2', margin: 0, paddingLeft: '20px' }}>
                <li>{t('passport_included_1', '✓ Full patient demographic header & ABHA ID registration')} (<b>{state.abhaData?.abha_number || '91-7294-8102-5309'}</b>)</li>
                <li>{t('passport_included_2', '✓ Date of Birth & PM-JAY Scheme Coverage Active')} (<b>{state.dob || state.yearOfBirth}</b>)</li>
                <li>{t('passport_included_3', '✓ Clinical triage urgency level & AI Council consensus')}</li>
                <li>{t('passport_included_4', '✓ Physiological vital benchmarks (Blood Pressure, Heart Rate, SpO2, Fasting Glucose)')}</li>
                <li>{t('passport_included_5', '✓ Active medication schedule & dosage safety check')}</li>
                <li>{t('passport_included_6', '✓ Tamper-Evident QR Code Stamp linking to IPFS & Ethereum contract')}</li>
              </ul>
            </div>

            <button
              onClick={state.handleDownloadPdf}
              disabled={state.downloading}
              style={{
                padding: '14px 28px',
                borderRadius: '12px',
                background: '#db2777',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(219, 39, 119, 0.3)'
              }}
            >
              <Download size={16} />
              {state.downloading ? 'Compiling PDF with ReportLab...' : `${t('btn_download_passport_pdf', 'Download Official Health Passport')} (${state.name})`}
            </button>
          </div>
        )}

        {(state.activeTab === 'blockchain' || state.activeTab === 'verify') && <RecordsList state={state} />}
        
      </div>
    </div>
  );
}
