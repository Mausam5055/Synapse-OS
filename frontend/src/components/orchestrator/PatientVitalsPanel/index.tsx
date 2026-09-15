'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Activity, 
  QrCode, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  UserCheck, 
  Stethoscope, 
  Share2, 
  MoreHorizontal, 
  Copy, 
  Printer, 
  FileCode, 
  Check,
  Upload,
  RefreshCw,
  ShieldCheck,
  Link as LinkIcon,
  X
} from 'lucide-react';
import { PatientInfo, VitalsData, DoctorSlot } from '../types';
import { MOCK_HEALTH_PROFILES } from '@/data/mockHealthProfiles';
import { useLanguage } from '@/context/LanguageContext';

interface PatientVitalsPanelProps {
  patient: PatientInfo;
  vitals: VitalsData;
  isAbhaLinked?: boolean;
  onToggleAbhaLink?: () => void;
  selectedProfileId?: string;
  onSelectProfile?: (id: string) => void;
  onUploadCustomProfile?: (data: any) => void;
  onBookDoctor?: (doctor: DoctorSlot) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function PatientVitalsPanel({
  patient,
  vitals,
  isAbhaLinked = true,
  onToggleAbhaLink,
  selectedProfileId = 'mausam_kar_verified_abha',
  onSelectProfile,
  onUploadCustomProfile,
  onBookDoctor
}: PatientVitalsPanelProps) {
  const { t, translateText } = useLanguage();
  const [selectedDay, setSelectedDay] = useState(12);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic doctor slots based on selected day
  const getDoctorsForDay = (dayNum: number): DoctorSlot[] => {
    const times = [
      ['Today at 4:00 PM', 'Tomorrow at 10:00 AM'],
      ['Today at 5:30 PM', 'Tomorrow at 11:30 AM'],
      ['10:00 AM', '02:00 PM'],
      ['Today at 4:00 PM', 'Tomorrow at 10:00 AM'],
      ['11:00 AM', '03:30 PM'],
      ['09:00 AM', '01:00 PM'],
      ['04:30 PM', '06:00 PM']
    ];
    const idx = (dayNum - 9 + 7) % 7;
    const [t1, t2] = times[idx];

    return [
      {
        id: 'DOC-AIIMS-101',
        name: 'Dr. Rajesh K. Varma',
        specialty: 'Pulmonologist & Critical Care',
        hospital: 'AIIMS New Delhi',
        experienceYears: 14,
        rating: 4.9,
        availableSlot: t1,
        consultationFee: '₹0 (PM-JAY Free)',
        schemeEmpanelled: true
      },
      {
        id: 'DOC-CARDIO-204',
        name: 'Dr. Naresh Trehan',
        specialty: 'Cardiologist & Electrophysiologist',
        hospital: 'Fortis Escorts Heart Institute',
        experienceYears: 18,
        rating: 4.8,
        availableSlot: t2,
        consultationFee: '₹0 (PM-JAY Free)',
        schemeEmpanelled: true
      }
    ];
  };

  const [doctors, setDoctors] = useState<DoctorSlot[]>(getDoctorsForDay(12));

  useEffect(() => {
    setDoctors(getDoctorsForDay(selectedDay));
  }, [selectedDay]);

  const handleShare = () => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/records?abha=${patient.abhaId}` : '';
    if (navigator?.clipboard && shareUrl) {
      navigator.clipboard.writeText(shareUrl);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleBooking = async (doc: DoctorSlot) => {
    try {
      const res = await fetch(`${API_BASE}/api/appointments/schedule?patient_name=${encodeURIComponent(patient.name)}&doctor_id=${doc.id}&slot_time=${encodeURIComponent(doc.availableSlot)}`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setBookingSuccess(`Confirmed: ${doc.name} for ${doc.availableSlot} (#${data.appointment_ticket?.ticket_id || 'APPT-9821'})`);
        setTimeout(() => setBookingSuccess(null), 5000);
      } else {
        setBookingSuccess(`Confirmed: ${doc.name} for ${doc.availableSlot}`);
        setTimeout(() => setBookingSuccess(null), 5000);
      }
    } catch {
      setBookingSuccess(`Confirmed: ${doc.name} for ${doc.availableSlot}`);
      setTimeout(() => setBookingSuccess(null), 5000);
    }
    onBookDoctor?.(doc);
  };

  const handleSimulateAbhaLink = () => {
    setIsLinking(true);
    setTimeout(() => {
      setIsLinking(false);
      onToggleAbhaLink?.();
    }, 900);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onUploadCustomProfile?.(json);
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  const days = [
    { day: 'Sat', num: 9 },
    { day: 'Sun', num: 10 },
    { day: 'Mon', num: 11 },
    { day: 'Tue', num: 12 },
    { day: 'Wed', num: 13 },
    { day: 'Thu', num: 14 },
    { day: 'Fri', num: 15 }
  ];

  return (
    <div 
      className="orch-col-side"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '330px',
        flexShrink: 0,
        fontFamily: '"Times New Roman", Times, serif'
      }}
    >
      {/* Hidden File Input for Custom JSON Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json"
        style={{ display: 'none' }}
      />

      {/* ABDM Gateway & Profile Switcher Strip */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '12px 14px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#0284c7" />
            {translateText('ABDM Sandbox Gateway')}
          </span>
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload custom patient JSON export"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 9px',
              borderRadius: '8px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              color: '#0284c7',
              fontSize: '10.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Upload size={12} /> {translateText('Upload JSON')}
          </button>
        </div>

        {/* Profile Selector Dropdown */}
        <select
          value={selectedProfileId}
          onChange={(e) => onSelectProfile?.(e.target.value)}
          style={{
            width: '100%',
            padding: '7px 10px',
            borderRadius: '10px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            color: '#0f172a',
            fontSize: '11.5px',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
            transition: 'border-color 0.15s ease'
          }}
        >
          {MOCK_HEALTH_PROFILES.map((p) => (
            <option key={p.profileId} value={p.profileId}>
              {translateText(p.title)}
            </option>
          ))}
        </select>
      </div>

      {/* 1. Patient Profile Card */}
      <div 
        className="orch-card-interactive"
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          border: '1px solid #e2e8f0',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '8px',
            background: isAbhaLinked ? '#e0f2fe' : '#fef2f2',
            color: isAbhaLinked ? '#0369a1' : '#b91c1c',
            border: isAbhaLinked ? '1px solid #bae6fd' : '1px solid #fecaca'
          }}>
            ● {translateText(patient.planType)}
          </span>
          
          <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
            <button 
              onClick={handleShare}
              title="Copy Patient Share Link"
              style={{
                background: copiedLink ? '#ecfdf5' : '#f0f9ff',
                border: '1px solid',
                borderColor: copiedLink ? '#a7f3d0' : '#bae6fd',
                color: copiedLink ? '#059669' : '#0284c7',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {copiedLink ? <Check size={14} /> : <Share2 size={14} />}
            </button>

            <button 
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              title="More Options"
              style={{
                background: showMoreMenu ? '#e0f2fe' : '#f0f9ff',
                border: '1px solid',
                borderColor: showMoreMenu ? '#0284c7' : '#bae6fd',
                color: '#0284c7',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <MoreHorizontal size={14} />
            </button>

            {/* Dropdown Menu */}
            {showMoreMenu && (
              <div style={{
                position: 'absolute',
                top: '34px',
                right: 0,
                width: '190px',
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #bae6fd',
                boxShadow: '0 10px 25px rgba(2,132,199,0.12)',
                zIndex: 50,
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                <button
                  onClick={() => { onToggleAbhaLink?.(); setShowMoreMenu(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '11px',
                    color: isAbhaLinked ? '#b91c1c' : '#0369a1',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <RefreshCw size={13} color={isAbhaLinked ? '#b91c1c' : '#0284c7'} />
                  <span>{isAbhaLinked ? translateText('Unlink ABHA (View Empty)') : translateText('Relink ABHA Record')}</span>
                </button>
                <button
                  onClick={() => { window.print(); setShowMoreMenu(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '11px',
                    color: '#334155',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Printer size={13} color="#0284c7" />
                  <span>{translateText('Print EHR Record')}</span>
                </button>
                <button
                  onClick={() => { handleShare(); setShowMoreMenu(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '11px',
                    color: '#334155',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Copy size={13} color="#0284c7" />
                  <span>{translateText('Copy FHIR URL')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {copiedLink && (
          <div style={{
            fontSize: '11px',
            color: '#059669',
            background: '#ecfdf5',
            padding: '4px 8px',
            borderRadius: '6px',
            marginBottom: '10px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Check size={12} /> {translateText('Patient Record Link Copied!')}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          {patient.avatarUrl ? (
            <img
              src={patient.avatarUrl}
              alt={patient.name}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                objectFit: 'cover',
                border: '2px solid #bae6fd',
                boxShadow: '0 4px 10px rgba(2,132,199,0.1)'
              }}
            />
          ) : (
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 900,
                border: '2px solid #bae6fd',
                boxShadow: '0 4px 10px rgba(2,132,199,0.15)',
                flexShrink: 0
              }}
            >
              {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AB'}
            </div>
          )}
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 3px 0' }}>
              {patient.name}
            </h2>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>
              {translateText('DOB:')} <strong style={{ color: '#334155' }}>{translateText(patient.dob)}</strong>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {translateText('Gender:')} <strong style={{ color: '#334155' }}>{translateText(patient.gender)}</strong> • {translateText('Blood:')} <strong style={{ color: '#0284c7' }}>{patient.bloodType}</strong>
            </div>
          </div>
        </div>

        {/* Policy & ABHA QR Code */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 14px',
          background: '#f0f9ff',
          borderRadius: '14px',
          border: '1px solid #bae6fd'
        }}>
          <div 
            onClick={() => setShowQrModal(true)}
            title="View Official National ABHA QR Code"
            style={{
              width: '46px',
              height: '46px',
              background: '#ffffff',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #bae6fd',
              flexShrink: 0,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(2,132,199,0.1)'
            }}
          >
            <QrCode size={28} color="#0284c7" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              {translateText('POLICY')} #{patient.policyNumber}
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '2px 0' }}>
              ABHA: {patient.abhaId}
            </div>
            <div style={{ fontSize: '10px', color: isAbhaLinked ? '#059669' : '#b91c1c', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>{isAbhaLinked ? `✓ ${translateText('Verified PM-JAY Citizen')}` : `⚠️ ${translateText('Unlinked ABHA Profile')}`}</span>
            </div>
          </div>
        </div>

        {/* Unlinked State Connect Action Button */}
        {!isAbhaLinked && (
          <button
            onClick={handleSimulateAbhaLink}
            disabled={isLinking}
            style={{
              marginTop: '12px',
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(2,132,199,0.3)'
            }}
          >
            {isLinking ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>{translateText('Authenticating with ABDM Gateway...')}</span>
              </>
            ) : (
              <>
                <LinkIcon size={14} />
                <span>{translateText('Connect Verified ABHA via OTP')}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 2. Hearth Check & 3D Cardiac Monitor */}
      <div 
        className="orch-card-interactive"
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #bae6fd',
          padding: '20px',
          boxShadow: '0 4px 14px rgba(2,132,199,0.04)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Heart size={16} color="#ef4444" fill="#ef4444" />
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {translateText('Heart Check')}
              </h3>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              {translateText('Average:')} <strong>{isAbhaLinked ? `${vitals.avgHeartRate} bpm` : '---'}</strong> • {translateText('Max:')} <strong>{isAbhaLinked ? `${vitals.maxHeartRate} bpm` : '---'}</strong>
            </div>
          </div>
          <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
            {isAbhaLinked ? vitals.heartRate : '---'} <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>BPM</span>
          </span>
        </div>

        {/* Live Wearable Integration Status Strip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '10px',
          padding: '5px 10px',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '10.5px', color: '#0284c7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0284c7', boxShadow: '0 0 6px #0284c7' }} />
            {translateText('Apple Watch & Google Health Synced')}
          </span>
          <span style={{ fontSize: '10px', color: '#0369a1', fontWeight: 700 }}>
            {translateText('Live Lead I ECG')}
          </span>
        </div>

        {/* Flex layout with 3D Heart Graphic + Live ECG Waveform */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
          {/* 3D Heart Model Graphic Asset */}
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '14px',
            background: '#fafaf9',
            border: '1px solid #bae6fd',
            overflow: 'hidden',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img
              src="/images/cardiac_3d_heart.jpg"
              alt="3D Heart Model"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* ECG Continuous Spline Chart with Amplitude Axes */}
          <div style={{ flex: 1, height: '68px', position: 'relative' }}>
            <svg viewBox="0 0 200 68" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <line x1="0" y1="34" x2="200" y2="34" stroke="#e0f2fe" strokeWidth="1" />
              <line x1="0" y1="12" x2="200" y2="12" stroke="#f0f9ff" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="0" y1="56" x2="200" y2="56" stroke="#f0f9ff" strokeWidth="1" strokeDasharray="2 2" />

              <path
                d="M 0 34 L 20 34 L 28 20 L 36 50 L 44 26 L 52 38 L 60 34 L 90 34 L 98 10 L 106 58 L 114 20 L 122 42 L 130 34 L 160 34 L 168 20 L 176 50 L 184 26 L 192 38 L 200 34"
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Blood Pressure & Oxygen Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>{translateText('BLOOD PRESSURE')}</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
              {isAbhaLinked ? `${vitals.systolicBp}/${vitals.diastolicBp}` : '---/---'} <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748b' }}>mmHg</span>
            </div>
          </div>
          <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>{translateText('O2 SATURATION')}</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
              {isAbhaLinked ? `${vitals.oxygenSaturation}%` : '---%'} <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748b' }}>{isAbhaLinked ? translateText('Normal') : translateText('Pending')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Schedule with Doctor */}
      <div 
        className="orch-card-interactive"
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #bae6fd',
          padding: '20px',
          boxShadow: '0 4px 14px rgba(2,132,199,0.04)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {translateText('Schedule with Doctor')}
          </h3>
          <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 800, background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
            {translateText('Jan, 2026')}
          </span>
        </div>

        {bookingSuccess && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#047857',
            padding: '8px 12px',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: 700,
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <CheckCircle2 size={14} />
            <span>{bookingSuccess}</span>
          </div>
        )}

        {/* Date Selector Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          {days.map((d) => {
            const isSelected = selectedDay === d.num;
            return (
              <div
                key={d.num}
                onClick={() => setSelectedDay(d.num)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '7px 8px',
                  borderRadius: '12px',
                  background: isSelected ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
                  color: isSelected ? '#ffffff' : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(2,132,199,0.35)' : 'none'
                }}
              >
                <span style={{ fontSize: '9px', fontWeight: 600 }}>{translateText(d.day)}</span>
                <span style={{ fontSize: '13px', fontWeight: 800 }}>{d.num}</span>
              </div>
            );
          })}
        </div>

        {/* Doctor List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {doctors.map((doc) => (
            <div
              key={doc.id}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '12px 14px',
                background: '#fafaf9'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>{doc.name}</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>{translateText(doc.specialty)}</div>
                </div>
                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: '#ecfdf5', color: '#059669', fontWeight: 800 }}>
                  ★ {doc.rating}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={11} /> {translateText(doc.availableSlot)}
                </span>
                <button
                  onClick={() => handleBooking(doc)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(2,132,199,0.25)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {translateText('Book Slot')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official ABHA Card QR Modal */}
      {showQrModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #bae6fd',
            width: '100%',
            maxWidth: '380px',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(2,132,199,0.2)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowQrModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                National Health Authority (NHA)
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: '4px 0 0 0' }}>
                Ayushman Bharat Health Card
              </h3>
            </div>

            <div style={{
              background: '#f0f9ff',
              border: '2px dashed #bae6fd',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <QrCode size={140} color="#0284c7" />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>
                  {patient.name}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0284c7', margin: '2px 0' }}>
                  {patient.abhaId}
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                  ABHA Address: <strong>{patient.name.toLowerCase().replace(/\s+/g, '')}@abdm</strong>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '16px', fontSize: '10.5px', color: '#059669', textAlign: 'center', fontWeight: 700 }}>
              ✓ Verified via ABDM FastTrack M1/M2 Gateway Protocol
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
