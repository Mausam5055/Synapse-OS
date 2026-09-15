'use client';

import React, { useState } from 'react';
import { Fingerprint, RefreshCw, Check, Copy, ShieldCheck, QrCode, Building2, User, Calendar, CreditCard, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function AbhaGenerator({ state }: { state: any }) {
  const [copied, setCopied] = useState(false);
  const { translateText } = useLanguage();

  const handleCopyAbha = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '20px', margin: 0, color: '#0f172a', fontWeight: 800 }}>
              {translateText('Ayushman Bharat Health Account (ABHA) Generator & Registry')}
            </h2>
            <p style={{ color: '#64748b', fontSize: '13.5px', margin: '4px 0 0 0', lineHeight: 1.5 }}>
              {translateText('Generate your official 14-digit ABDM-compliant health number to link hospital records, lab reports, and claim PM-JAY ₹5L annual coverage.')}
            </p>
          </div>

          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '9999px',
            background: '#ecfdf5',
            color: '#059669',
            border: '1px solid #a7f3d0',
            fontSize: '11px',
            fontWeight: 800
          }}>
            <ShieldCheck size={14} />
            {translateText('ABDM Sandbox Active')}
          </span>
        </div>
      </div>

      {/* Auto-Sync Notification Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        border: '1px solid #bae6fd',
        borderRadius: '14px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: '#ffffff',
            border: '1px solid #bae6fd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0284c7'
          }}>
            <Sparkles size={16} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#0369a1' }}>
              {translateText('Auto-Synced with Active Citizen Profile')}
            </div>
            <div style={{ fontSize: '11.5px', color: '#475569' }}>
              {translateText('Showing verified ABDM records for')} <strong style={{ color: '#0f172a' }}>{state.name}</strong> • {translateText('DOB:')} <strong style={{ color: '#0f172a' }}>{translateText(state.dob || state.yearOfBirth)}</strong>
            </div>
          </div>
        </div>

        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          color: '#0284c7',
          background: '#ffffff',
          padding: '4px 10px',
          borderRadius: '6px',
          border: '1px solid #bae6fd'
        }}>
          {translateText('Live Patient Telemetry Sync')}
        </span>
      </div>

      {/* Input / Form Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr auto',
        gap: '16px',
        alignItems: 'flex-end',
        background: '#f8fafc',
        padding: '20px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0'
      }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <User size={13} color="#0284c7" />
            {translateText('Citizen Full Name')}
          </label>
          <input
            type="text"
            value={state.name}
            onChange={(e) => state.setName(e.target.value)}
            placeholder="e.g. Mausam Kar"
            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '14px', boxSizing: 'border-box', outline: 'none', fontWeight: 600 }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Calendar size={13} color="#0284c7" />
            {translateText('Year of Birth (YOB)')}
          </label>
          <input
            type="text"
            value={state.yearOfBirth}
            onChange={(e) => state.setYearOfBirth(e.target.value)}
            placeholder="e.g. 2002"
            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '14px', boxSizing: 'border-box', outline: 'none', fontWeight: 600 }}
          />
        </div>

        <div>
          <button
            onClick={state.handleGenerateAbha}
            disabled={state.loading}
            style={{ 
              padding: '12px 24px', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
              color: '#fff', 
              border: 'none', 
              cursor: 'pointer', 
              fontWeight: 800,
              fontSize: '13.5px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              height: '45px',
              whiteSpace: 'nowrap'
            }}
          >
            {state.loading ? <RefreshCw size={15} className="animate-spin" /> : <Fingerprint size={15} />}
            {state.loading ? translateText('Generating ABDM ID...') : translateText('Generate ABHA ID')}
          </button>
        </div>
      </div>

      {/* Official Government of India ABHA ID Card */}
      {state.abhaData && (
        <div style={{
          background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 50%, #f0fdf4 100%)',
          border: '2px solid #fbcfe8',
          borderRadius: '24px',
          padding: '32px',
          position: 'relative',
          boxShadow: '0 12px 36px rgba(219, 39, 119, 0.08)',
          overflow: 'hidden'
        }}>
          {/* Subtle Watermark Emblem Background */}
          <div style={{
            position: 'absolute',
            right: '-30px',
            bottom: '-30px',
            width: '240px',
            height: '240px',
            opacity: 0.04,
            backgroundImage: 'radial-gradient(circle, #db2777 20%, transparent 80%)',
            pointerEvents: 'none'
          }} />

          {/* Top Bar: Authority Branding & Verified Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #fce7f3', paddingBottom: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #db2777 0%, #9d174d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '18px',
                boxShadow: '0 4px 12px rgba(219, 39, 119, 0.3)'
              }}>
                <Fingerprint size={26} />
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#db2777', fontWeight: 800 }}>
                  {translateText('Government of India • National Health Authority')}
                </span>
                <h4 style={{ margin: '2px 0 0 0', fontSize: '15px', color: '#0f172a', fontWeight: 800 }}>
                  {translateText('Ayushman Bharat Digital Mission (ABDM) Health Card')}
                </h4>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ padding: '6px 14px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', fontWeight: 800, fontSize: '11px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                ✓ {translateText('PM-JAY VERIFIED')}
              </span>
              <span style={{ padding: '6px 14px', borderRadius: '12px', background: '#eff6ff', color: '#0284c7', fontWeight: 800, fontSize: '11px', border: '1px solid #bae6fd' }}>
                ● {translateText('ACTIVE')}
              </span>
            </div>
          </div>

          {/* Main Card Body */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '32px', alignItems: 'center' }}>
            {/* Left: Demographics & ABHA credentials */}
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                {translateText('Citizen Beneficiary')}
              </div>
              <h3 style={{ fontSize: '28px', margin: '0 0 8px 0', color: '#0f172a', fontWeight: 900, letterSpacing: '-0.02em' }}>
                {state.abhaData.name}
              </h3>

              {/* 14-digit ABHA Number Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <div style={{
                  fontSize: '22px',
                  letterSpacing: '2.5px',
                  fontWeight: 900,
                  color: '#db2777',
                  fontFamily: 'monospace',
                  background: '#ffffff',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #fbcfe8',
                  boxShadow: '0 2px 8px rgba(219, 39, 119, 0.1)'
                }}>
                  {state.abhaData.abha_number}
                </div>

                <button
                  onClick={() => handleCopyAbha(state.abhaData.abha_number)}
                  title="Copy 14-digit ABHA ID"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: copied ? '#ecfdf5' : '#ffffff',
                    border: '1px solid ' + (copied ? '#a7f3d0' : '#cbd5e1'),
                    color: copied ? '#059669' : '#475569',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? translateText('Copied') : translateText('Copy')}
                </button>
              </div>

              {/* Demographic Matrix */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                marginTop: '16px',
                background: 'rgba(255,255,255,0.7)',
                padding: '16px',
                borderRadius: '14px',
                border: '1px solid #fce7f3'
              }}>
                <div>
                  <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{translateText('ABHA Address')}</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginTop: '2px', fontFamily: 'monospace' }}>
                    {state.abhaData.abha_address}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{translateText('Date of Birth')}</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {translateText(state.dob || `YOB: ${state.yearOfBirth}`)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{translateText('Gender / Blood')}</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {translateText(state.abhaData.gender || 'Male')} • <strong style={{ color: '#db2777' }}>{state.abhaData.blood_type || 'B+'}</strong>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{translateText('PM-JAY Coverage')}</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                    {translateText('₹5,00,000 / Year Free')}
                  </div>
                </div>
              </div>

              {/* Linked HIP Facility */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '12px', color: '#475569' }}>
                <Building2 size={15} color="#db2777" />
                <span>{translateText('Linked HIP Node:')} <strong style={{ color: '#0f172a' }}>{translateText(state.abhaData.linked_hip || 'All India Institute of Medical Sciences (AIIMS)')}</strong></span>
              </div>
            </div>

            {/* Right: Cryptographic QR Code Stamp */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              background: '#ffffff',
              padding: '18px',
              borderRadius: '18px',
              border: '1.5px solid #fbcfe8',
              boxShadow: '0 4px 16px rgba(219, 39, 119, 0.08)'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                background: '#ffffff',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e2e8f0',
                position: 'relative'
              }}>
                <QrCode size={105} color="#0f172a" />
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {translateText('Official ABDM QR Stamp')}<br/>
                <span style={{ color: '#db2777' }}>{translateText('Scan for EHR Access')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
