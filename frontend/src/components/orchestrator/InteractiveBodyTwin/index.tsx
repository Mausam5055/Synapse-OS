'use client';

import React, { useState } from 'react';
import { 
  Maximize2, 
  RotateCw, 
  Layers, 
  Activity, 
  Plus, 
  Minus,
  Sparkles,
  Info,
  ChevronRight,
  ShieldAlert,
  Zap,
  ArrowRight
} from 'lucide-react';
import { DetectedCondition } from '../types';
import { useLanguage } from '@/context/LanguageContext';

interface InteractiveBodyTwinProps {
  conditions: DetectedCondition[];
  selectedCondition: DetectedCondition | null;
  onSelectCondition: (c: DetectedCondition) => void;
  onNavigateToSwarmTab?: () => void;
}

export default function InteractiveBodyTwin({
  conditions,
  selectedCondition,
  onSelectCondition,
  onNavigateToSwarmTab
}: InteractiveBodyTwinProps) {
  const { t, translateText } = useLanguage();
  const [activeLayer, setActiveLayer] = useState<'all' | 'muscular' | 'skeletal' | 'vascular'>('all');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(Math.max(0.85, prev + delta), 1.4));
  };

  const lungsCondition = conditions.find(c => c.organ === 'lungs') || conditions[0];
  const kneeCondition = conditions.find(c => c.organ === 'knee');
  const shoulderCondition = conditions.find(c => c.organ === 'shoulder');
  const heartCondition = conditions.find(c => c.organ === 'heart');

  // Layer specific configurations and visual filters
  const layerConfigs = {
    all: {
      label: 'Composite Twin',
      badge: 'Full Anatomical Overview',
      filter: 'none',
      bgGlow: 'radial-gradient(circle at 50% 45%, #fdf2f8 0%, #ffffff 70%)'
    },
    muscular: {
      label: 'Muscular System',
      badge: 'Myological Tissue Mapping (42% Density)',
      filter: 'contrast(1.3) saturate(1.8) hue-rotate(340deg) drop-shadow(0 0 15px rgba(239, 68, 68, 0.2))',
      bgGlow: 'radial-gradient(circle at 50% 45%, #fff1f2 0%, #ffffff 70%)'
    },
    skeletal: {
      label: 'Skeletal Framework',
      badge: 'Osteo-Radiological Density Model (T-Score -1.2)',
      filter: 'invert(0.88) contrast(1.6) brightness(1.1) grayscale(0.85) drop-shadow(0 0 18px rgba(244, 114, 182, 0.3))',
      bgGlow: 'radial-gradient(circle at 50% 45%, #f0fdf4 0%, #ffffff 70%)'
    },
    vascular: {
      label: 'Vascular Network',
      badge: 'Arterial & Capillary Perfusion Live Map',
      filter: 'contrast(1.4) hue-rotate(200deg) saturate(2.2) drop-shadow(0 0 20px rgba(99, 102, 241, 0.3))',
      bgGlow: 'radial-gradient(circle at 50% 45%, #eef2ff 0%, #ffffff 70%)'
    }
  };

  const currentLayer = layerConfigs[activeLayer];

  return (
    <div 
      className="orch-col-center"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        height: 'calc(100vh - 130px)',
        fontFamily: '"Times New Roman", Times, serif'
      }}
    >
      {/* 1. Main 3D Anatomy Digital Twin Canvas Card */}
      <div 
        style={{
          flex: 1,
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '660px'
        }}
      >
        {/* Top Floating Controls Bar */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '18px',
          right: '18px',
          zIndex: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
          gap: '10px'
        }}>
          {/* Layer Mode Switcher */}
          <div style={{
            display: 'flex',
            gap: '3px',
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(10px)',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            pointerEvents: 'auto'
          }}>
            {(['all', 'muscular', 'skeletal', 'vascular'] as const).map((layer) => (
              <button
                key={layer}
                onClick={() => setActiveLayer(layer)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  background: activeLayer === layer ? '#0284c7' : 'transparent',
                  color: activeLayer === layer ? '#ffffff' : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: activeLayer === layer ? '0 2px 6px rgba(2, 132, 199, 0.25)' : 'none'
                }}
              >
                {translateText(layer === 'all' ? 'All' : layer.charAt(0).toUpperCase() + layer.slice(1))}
              </button>
            ))}
          </div>

          {/* 3D Health Twin Live Badge + Wearable Sync Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '10px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              fontSize: '11px',
              fontWeight: 700,
              pointerEvents: 'auto',
              boxShadow: '0 1px 3px rgba(16, 185, 129, 0.08)'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              <span>{translateText('Watch Calibrated (HRV 58ms • VO2 Max 44.5)')}</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '10px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#0284c7',
              fontSize: '11px',
              fontWeight: 700,
              pointerEvents: 'auto',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
            }}>
              <Sparkles size={13} />
              <span>{translateText(currentLayer.badge)}</span>
            </div>
          </div>
        </div>

        {/* Main Anatomy Canvas Area */}
        <div style={{
          flex: 1,
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: currentLayer.bgGlow,
          transition: 'background 0.4s ease'
        }}>
          {/* Scalable Container for Body Graphic and Hotspots */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            maxWidth: '520px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* High-Resolution 3D Anatomical Body Model Asset */}
            <img
              src="/images/anatomy_digital_twin.jpg"
              alt="3D Digital Health Twin"
              style={{
                maxHeight: '92%',
                maxWidth: '90%',
                objectFit: 'contain',
                userSelect: 'none',
                pointerEvents: 'none',
                filter: currentLayer.filter,
                transition: 'filter 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />

            {/* SVG Connecting Spline Cables between Hotspots and Callouts */}
            <svg 
              viewBox="0 0 520 700" 
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 15
              }}
            >
              {/* Lungs connecting curve */}
              <path
                d="M 285 205 C 330 205, 370 170, 420 155"
                fill="none"
                stroke="#db2777"
                strokeWidth="2"
                strokeDasharray="4 3"
                opacity="0.8"
              />
              <circle cx="420" cy="155" r="3.5" fill="#db2777" />
            </svg>

            {/* Hotspot 1: Lungs (Pulmonary Function Test) */}
            <div
              onClick={() => lungsCondition && onSelectCondition(lungsCondition)}
              onMouseEnter={() => setHoveredHotspot('lungs')}
              onMouseLeave={() => setHoveredHotspot(null)}
              style={{
                position: 'absolute',
                top: '28%',
                left: '52%',
                zIndex: 30,
                cursor: 'pointer',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div 
                className="hotspot-pulse-primary"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: selectedCondition?.organ === 'lungs' ? '#be185d' : '#db2777',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 800,
                  border: '2.5px solid #ffffff',
                  boxShadow: '0 4px 14px rgba(219, 39, 119,0.45)',
                  transition: 'transform 0.2s ease'
                }}
              >
                🫁
              </div>

              {/* Connecting Callout Card */}
              <div style={{
                position: 'absolute',
                top: '-35px',
                left: '46px',
                background: '#ffffff',
                borderRadius: '14px',
                padding: '12px 16px',
                border: selectedCondition?.organ === 'lungs' ? '2px solid #db2777' : '1.5px solid #fbcfe8',
                boxShadow: '0 8px 24px rgba(219, 39, 119,0.14)',
                width: '210px',
                pointerEvents: 'auto',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                    {translateText(lungsCondition?.title || 'Pulmonary Aerobic Function')}
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '1px 6px', borderRadius: '4px' }}>
                    {lungsCondition?.metrics?.o2 || '98.5%'}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  {translateText('FEV1')}: <strong>{lungsCondition?.metrics?.fev1 || '4.8 L'}</strong> • {translateText('Heart')}: <strong>{lungsCondition?.metrics?.heartRate || '74 BPM'}</strong>
                </div>
                <div style={{ fontSize: '10px', color: '#0284c7', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{lungsCondition?.doctor || 'Dr. Rajesh K. Varma'}</span>
                  <ChevronRight size={10} />
                </div>
              </div>
            </div>

            {/* Hotspot 2: Left Shoulder (Pain & Joint Mobility) */}
            <div
              onClick={() => shoulderCondition && onSelectCondition(shoulderCondition)}
              onMouseEnter={() => setHoveredHotspot('shoulder')}
              onMouseLeave={() => setHoveredHotspot(null)}
              style={{
                position: 'absolute',
                top: '22%',
                left: '32%',
                zIndex: 30,
                cursor: 'pointer',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div 
                className="hotspot-pulse-warning"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: selectedCondition?.organ === 'shoulder' ? '#d97706' : '#f59e0b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 900,
                  border: '2px solid #ffffff',
                  boxShadow: '0 4px 10px rgba(245,158,11,0.45)'
                }}
              >
                !
              </div>
            </div>

            {/* Hotspot 3: Left Knee (Osteoarthritis Alert) */}
            <div
              onClick={() => kneeCondition && onSelectCondition(kneeCondition)}
              onMouseEnter={() => setHoveredHotspot('knee')}
              onMouseLeave={() => setHoveredHotspot(null)}
              style={{
                position: 'absolute',
                top: '68%',
                left: '46%',
                zIndex: 30,
                cursor: 'pointer',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div 
                className="hotspot-pulse-danger"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.25)',
                  border: selectedCondition?.organ === 'knee' ? '3px solid #b91c1c' : '2.5px solid #ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 18px rgba(239,68,68,0.4)'
                }}
              >
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
              </div>
            </div>

            {/* Hotspot 4: Brain (Cognitive & Mental Vitality) */}
            <div
              onMouseEnter={() => setHoveredHotspot('brain')}
              onMouseLeave={() => setHoveredHotspot(null)}
              style={{
                position: 'absolute',
                top: '8%',
                left: '50%',
                zIndex: 30,
                cursor: 'pointer',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div 
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#8b5cf6',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 800,
                  border: '2px solid #ffffff',
                  boxShadow: '0 2px 10px rgba(139,92,246,0.35)'
                }}
              >
                1
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Left Viewport Zoom Controls */}
        <div style={{
          position: 'absolute',
          bottom: '18px',
          left: '18px',
          zIndex: 20,
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={() => handleZoom(0.1)}
            title="Zoom In"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.15s ease'
            }}
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => handleZoom(-0.1)}
            title="Zoom Out"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.15s ease'
            }}
          >
            <Minus size={16} />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            title="Reset Zoom"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.15s ease'
            }}
          >
            <RotateCw size={15} />
          </button>
          <a
            href="/vibrant"
            data-no-swup="true"
            title="Launch 3D Organ Simulation Studio"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#fdf2f8',
              border: '1px solid #fbcfe8',
              color: '#db2777',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(219, 39, 119,0.15)',
              textDecoration: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Maximize2 size={16} />
          </a>
        </div>
      </div>

      {/* 2. Dedicated Swarm DAG Banner Below Twin */}
      {onNavigateToSwarmTab && (
        <button
          onClick={onNavigateToSwarmTab}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdfa 100%)',
            borderRadius: '16px',
            padding: '14px 20px',
            border: '1px solid #bae6fd',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.06)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            fontFamily: 'inherit'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(2, 132, 199, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(2, 132, 199, 0.06)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.12)'
            }}>
              <Zap size={20} color="#0284c7" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0369a1', letterSpacing: '-0.01em' }}>
                {translateText('Run Agent Swarm DAG')}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, marginTop: '1px' }}>
                {translateText('Execute cross-agent diagnostic & clinical consensus protocol')}
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            padding: '7px 14px',
            borderRadius: '8px',
            fontSize: '11.5px',
            fontWeight: 700,
            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
          }}>
            <span>{translateText('Launch Swarm')}</span>
            <ChevronRight size={14} />
          </div>
        </button>
      )}
    </div>
  );
}
