import React from 'react';
import { ShieldCheck, Stethoscope, Pill, Syringe } from 'lucide-react';
import { DiseaseProfile } from './types';
import { useLanguage } from '@/context/LanguageContext';

interface ClinicalProtocolsProps {
  activeDisease: DiseaseProfile;
}

export default function ClinicalProtocols({ activeDisease }: ClinicalProtocolsProps) {
  const { translateText } = useLanguage();

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '20px',
      border: '1px solid #e2e8f0',
      padding: '24px 28px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
      fontFamily: '"Times New Roman", Times, serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
        <div>
          <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {translateText('Step 2: Clinical Protocols & Evidence-Based Directives')}
          </span>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>
            {translateText('WHO Clinical Guidelines & Precautions:')} {translateText(activeDisease.name)}
          </h3>
        </div>
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '4px 10px', borderRadius: '8px' }}>
          {translateText('WHO Essential Guidance 2026')}
        </span>
      </div>

      {/* 4 Clean Clinical Directives Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        alignItems: 'stretch'
      }}>
        {/* Card 1: Precautions & Prevention */}
        <div style={{
          height: '100%',
          background: '#f8fafc',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={15} />
            <span>{translateText('1. Primary Precautions')}</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#334155', lineHeight: 1.6 }}>
            {activeDisease.precautions.map((p, idx) => (
              <li key={idx} style={{ marginBottom: '6px' }}>{translateText(p)}</li>
            ))}
          </ul>
        </div>

        {/* Card 2: Diagnostics & Screening */}
        <div style={{
          height: '100%',
          background: '#f8fafc',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Stethoscope size={15} />
            <span>{translateText('2. Diagnostics & Labs')}</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#334155', lineHeight: 1.6 }}>
            {activeDisease.diagnostics.map((d, idx) => (
              <li key={idx} style={{ marginBottom: '6px' }}>{translateText(d)}</li>
            ))}
          </ul>
          <div style={{ marginTop: 'auto', fontSize: '10.5px', fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', padding: '6px 10px', borderRadius: '8px', border: '1px solid #ddd6fe' }}>
            ✓ {translateText('Gold Standard Sensitivity > 96%')}
          </div>
        </div>

        {/* Card 3: First-Line Therapeutics */}
        <div style={{
          height: '100%',
          background: '#f8fafc',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#059669', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Pill size={15} />
            <span>{translateText('3. First-Line Therapeutics')}</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#334155', lineHeight: 1.6 }}>
            {activeDisease.firstLineTherapy.map((t, idx) => (
              <li key={idx} style={{ marginBottom: '6px' }}>{translateText(t)}</li>
            ))}
          </ul>
          <div style={{ marginTop: 'auto', fontSize: '10.5px', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '6px 10px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
            ✓ {translateText('WHO Essential Medicines 2026')}
          </div>
        </div>

        {/* Card 4: Vaccine & Immunization */}
        <div style={{
          height: '100%',
          background: '#f8fafc',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Syringe size={15} />
            <span>{translateText('4. Vaccine & Prophylaxis')}</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#334155', lineHeight: 1.6 }}>
            {activeDisease.vaccineStatus.map((v, idx) => (
              <li key={idx} style={{ marginBottom: '6px' }}>{translateText(v)}</li>
            ))}
          </ul>
          <div style={{ marginTop: 'auto', fontSize: '10.5px', fontWeight: 700, color: '#ea580c', background: '#fff7ed', padding: '6px 10px', borderRadius: '8px', border: '1px solid #ffedd5' }}>
            ✓ {translateText('Strategic Global Advisory')}
          </div>
        </div>
      </div>
    </div>
  );
}
