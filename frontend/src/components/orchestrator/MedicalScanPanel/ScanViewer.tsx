import React from 'react';
import { RefreshCw } from 'lucide-react';
import { ModalityType } from './useMedicalScan';
import { useLanguage } from '@/context/LanguageContext';

export default function ScanViewer({ state }: { state: any }) {
  const { t, translateText } = useLanguage();
  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
      {/* Canvas Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: state.uploadedImagePreview ? '#10b981' : '#3b82f6' }}></span>
          <span>{state.uploadedFileName ? `${translateText('Scan:')} ${state.uploadedFileName}` : translateText(state.modality === 'bone_fracture' ? 'FractureNet Orthopedic X-Ray Specimen' : state.modality === 'chest_xray' ? 'Standard PA Chest Radiograph' : state.modality === 'prescription' ? 'Digital Prescription Specimen' : 'Clinical Metabolic Specimen')}</span>
        </div>

        {/* Canvas Controls */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {state.modality === 'bone_fracture' && (
            <button
              onClick={() => state.setShowGradCam(!state.showGradCam)}
              style={{
                fontSize: '11px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: state.showGradCam ? '#fef2f2' : '#f8fafc',
                color: state.showGradCam ? '#ef4444' : '#64748b',
                border: '1px solid ' + (state.showGradCam ? '#fecaca' : '#e2e8f0'),
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              {state.showGradCam ? translateText('🔥 Grad-CAM ON') : translateText('🔥 Grad-CAM Heatmap')}
            </button>
          )}

          <button
            onClick={() => state.setShowOverlays(!state.showOverlays)}
            style={{
              fontSize: '11px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: state.showOverlays ? '#eff6ff' : '#f8fafc',
              color: state.showOverlays ? '#3b82f6' : '#64748b',
              border: '1px solid ' + (state.showOverlays ? '#bfdbfe' : '#e2e8f0'),
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            {state.showOverlays ? translateText('👁️ Overlays ON') : translateText('👁️ Overlays OFF')}
          </button>

          <button
            onClick={() => state.setContrastMode((m: string) => m === 'normal' ? 'high' : m === 'high' ? 'inverted' : 'normal')}
            style={{
              fontSize: '11px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#f8fafc',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              fontWeight: 700
            }}
            title="Cycle contrast windowing"
          >
            🌓 {translateText(state.contrastMode.toUpperCase())}
          </button>
        </div>
      </div>

      {/* Canvas Viewing Area / Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); state.setIsDragging(true); }}
        onDragLeave={() => state.setIsDragging(false)}
        onDrop={state.handleDrop}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4/3',
          backgroundColor: '#02040a',
          borderRadius: '16px',
          border: state.isDragging ? '2px dashed #db2777' : '1px solid #cbd5e1',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: state.contrastMode === 'high' ? 'contrast(1.4) brightness(1.1)' : state.contrastMode === 'inverted' ? 'invert(1) hue-rotate(180deg)' : 'none',
          transition: 'all 0.2s ease',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
        }}
      >
        
        {/* 1. Custom Uploaded Image */}
        {state.uploadedImagePreview ? (
          <img
            src={state.uploadedImagePreview}
            alt="Uploaded medical scan"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : state.modality === 'bone_fracture' ? (
          
          /* 2. FractureNet Bone Fracture X-Ray Real Medical Specimen */
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src="https://images.unsplash.com/photo-1559703248-dcaaec9fac45?auto=format&fit=crop&w=800&q=80"
              alt="FractureNet X-Ray Sample"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
            />

            {/* Optional Grad-CAM Heatmap Radial Layer */}
            {state.showGradCam && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 60% 70%, rgba(239,68,68,0.7) 0%, rgba(245,158,11,0.45) 25%, rgba(16,185,129,0.2) 45%, transparent 70%)',
                mixBlendMode: 'screen',
                pointerEvents: 'none'
              }} />
            )}

            {/* DICOM Overlay Header */}
            <div style={{ position: 'absolute', top: '10px', left: '12px', color: 'rgba(255,255,255,0.8)', fontSize: '11px', fontFamily: 'monospace', pointerEvents: 'none', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              {translateText('PATIENT:')} ORTHO-RADIUS-9148<br/>
              {translateText('STUDY:')} FOREARM / WRIST AP-LAT<br/>
              {translateText('MODEL:')} FRACTURENET YOLOV8
            </div>

            <div style={{ position: 'absolute', top: '10px', right: '12px', color: '#38bdf8', fontSize: '12px', fontWeight: 'bold', fontFamily: 'sans-serif', pointerEvents: 'none', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              {translateText('YOLOV8 INFERENCE: 14.2ms')}
            </div>
          </div>

        ) : state.modality === 'chest_xray' ? (
          
          /* 3. Realistic Clinical Chest X-Ray SVG Viewport */
          <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="lung-glow-left" cx="35%" cy="45%" r="40%">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#090d16" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#02040a" stopOpacity="1" />
              </radialGradient>
              <radialGradient id="lung-glow-right" cx="65%" cy="45%" r="40%">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#090d16" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#02040a" stopOpacity="1" />
              </radialGradient>
              <radialGradient id="infiltration-opacity" cx="65%" cy="65%" r="25%">
                <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.55" />
                <stop offset="50%" stopColor="#94a3b8" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#02040a" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* DICOM Overlay Header */}
            <text x="24" y="32" fill="#64748b" fontSize="11" fontFamily="monospace">PATIENT: SYNAPSEOS CITIZEN #91-7294</text>
            <text x="24" y="48" fill="#64748b" fontSize="11" fontFamily="monospace">STUDY: CHEST PA (ER-PORTABLE)</text>
            <text x="660" y="32" fill="#38bdf8" fontSize="12" fontWeight="bold" fontFamily="sans-serif">SYNAPSEOS DICOM</text>
            <text x="740" y="48" fill="#64748b" fontSize="11" fontFamily="monospace">kVp: 120</text>
            <text x="740" y="64" fill="#64748b" fontSize="11" fontFamily="monospace">W:2400 L:-400</text>

            {/* Left & Right Lung Transparency Cavities */}
            <ellipse cx="300" cy="270" rx="140" ry="190" fill="url(#lung-glow-left)" />
            <ellipse cx="500" cy="270" rx="140" ry="190" fill="url(#lung-glow-right)" />

            {/* Right Lower Lobe Infiltration Cloud (Pathology) */}
            <ellipse cx="520" cy="360" rx="90" ry="70" fill="url(#infiltration-opacity)" />

            {/* Spine Column */}
            <rect x="388" y="80" width="24" height="420" fill="#334155" opacity="0.65" rx="4" />
            {[120, 155, 190, 225, 260, 295, 330, 365, 400, 435].map((y, idx) => (
              <line key={idx} x1="386" y1={y} x2="414" y2={y} stroke="#64748b" strokeWidth="2" opacity="0.8" />
            ))}

            {/* Clavicles (Collar Bones) */}
            <path d="M 230 110 Q 340 125 390 140" stroke="#94a3b8" strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.75" />
            <path d="M 570 110 Q 460 125 410 140" stroke="#94a3b8" strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.75" />

            {/* Rib Cage Contours */}
            {[150, 190, 230, 270, 310, 350, 390, 430].map((y, idx) => (
              <g key={idx} opacity="0.5">
                <path d={`M 390 ${y-20} Q ${250 - idx*6} ${y} 180 ${y+30}`} stroke="#64748b" strokeWidth="8" strokeLinecap="round" fill="none" />
                <path d={`M 410 ${y-20} Q ${550 + idx*6} ${y} 620 ${y+30}`} stroke="#64748b" strokeWidth="8" strokeLinecap="round" fill="none" />
              </g>
            ))}

            {/* Cardiac Silhouette (Heart Shadow) */}
            <path d="M 385 240 Q 320 290 330 380 Q 380 430 425 430 Q 450 380 415 250 Z" fill="#475569" opacity="0.85" stroke="#64748b" strokeWidth="2" />

            {/* Diaphragm Domes */}
            <path d="M 160 490 Q 280 420 400 480" stroke="#94a3b8" strokeWidth="14" fill="#030712" opacity="0.9" />
            <path d="M 400 480 Q 520 420 640 490" stroke="#94a3b8" strokeWidth="14" fill="#030712" opacity="0.9" />

            {/* Anatomical Marker */}
            <text x="720" y="550" fill="#f8fafc" fontSize="24" fontWeight="bold" fontFamily="sans-serif">R</text>
            <text x="60" y="550" fill="#64748b" fontSize="12" fontFamily="monospace">MONAI SEGMENTATION TARGET</text>
          </svg>

        ) : state.modality === 'prescription' ? (
          
          /* 4. Realistic Digitized Prescription Specimen */
          <div style={{ width: '100%', height: '100%', overflowY: 'auto', background: '#ffffff', color: '#0f172a', padding: '32px', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
            {/* Clinic Header */}
            <div style={{ borderBottom: '2px solid #db2777', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '16px', color: '#db2777' }}>AIIMS CENTRAL CLINICAL NODE</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Dr. Rajesh K. Varma, MD • Registration: MCI-84920</div>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'right' }}>
                Date: 18-AUG-2026<br/>
                Patient: ABDM Verified Citizen
              </div>
            </div>

            {/* Rx Symbol */}
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#db2777', margin: '12px 0 8px 0', flexShrink: 0 }}>℞</div>

            {/* Prescription Lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '4px 8px', marginBottom: '20px' }}>
              <div style={{ background: '#fdf2f8', padding: '6px 10px', borderRadius: '6px', borderLeft: '3px solid #db2777' }}>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>1. Amoxicillin 500mg Capsules</div>
                <div style={{ fontSize: '11px', color: '#475569' }}>1 Cap TDS (Three times daily) x 5 days — [After Meals]</div>
              </div>

              <div style={{ background: '#fdf2f8', padding: '6px 10px', borderRadius: '6px', borderLeft: '3px solid #db2777' }}>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>2. Paracetamol 650mg Tablets</div>
                <div style={{ fontSize: '11px', color: '#475569' }}>1 Tab SOS (As needed for fever &gt; 100°F or body ache)</div>
              </div>

              <div style={{ background: '#fdf2f8', padding: '6px 10px', borderRadius: '6px', borderLeft: '3px solid #db2777' }}>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>3. Cetirizine 10mg Tablets</div>
                <div style={{ fontSize: '11px', color: '#475569' }}>1 Tab OD at Bedtime x 3 days</div>
              </div>
            </div>

            {/* Doctor Signature Stamp */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '8px', fontSize: '10px', color: '#64748b' }}>
              <span>Digitized via TrOCR Transformer Pipeline</span>
              <span style={{ fontStyle: 'italic', fontWeight: 600, color: '#0f172a' }}>Verified Signature: Dr. Rajesh K. Varma, MD</span>
            </div>
          </div>

        ) : (
          
          /* 5. Realistic Metabolic Lab Report Specimen */
          <div style={{ width: '100%', height: '100%', overflowY: 'auto', background: '#ffffff', color: '#0f172a', padding: '32px', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
            <div style={{ borderBottom: '2px solid #10b981', paddingBottom: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '16px', color: '#10b981' }}>METABOLIC PATHOLOGY PANEL</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>NABL Accredited Clinical Bio-Analysis</div>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'right' }}>
                Sample ID: #LAB-91820<br/>Status: Completed
              </div>
            </div>

            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', marginBottom: '16px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px' }}>Test Parameter</th>
                  <th style={{ padding: '8px 10px' }}>Patient Value</th>
                  <th style={{ padding: '8px 10px' }}>Reference Range</th>
                  <th style={{ padding: '8px 10px' }}>Flag</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '6px' }}>Hemoglobin</td>
                  <td style={{ padding: '6px', fontWeight: 600 }}>13.8 g/dL</td>
                  <td style={{ padding: '6px', color: '#64748b' }}>12.0 - 16.0 g/dL</td>
                  <td style={{ padding: '6px', color: '#10b981', fontWeight: 700 }}>NORMAL</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#fffbeb' }}>
                  <td style={{ padding: '6px' }}>Fasting Blood Glucose</td>
                  <td style={{ padding: '6px', fontWeight: 700, color: '#d97706' }}>104 mg/dL</td>
                  <td style={{ padding: '6px', color: '#64748b' }}>70 - 99 mg/dL</td>
                  <td style={{ padding: '6px', color: '#d97706', fontWeight: 700 }}>ELEVATED</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#fffbeb' }}>
                  <td style={{ padding: '6px' }}>Total Cholesterol</td>
                  <td style={{ padding: '6px', fontWeight: 700, color: '#d97706' }}>215 mg/dL</td>
                  <td style={{ padding: '6px', color: '#64748b' }}>&lt; 200 mg/dL</td>
                  <td style={{ padding: '6px', color: '#d97706', fontWeight: 700 }}>BORDERLINE</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px' }}>Serum Creatinine</td>
                  <td style={{ padding: '6px', fontWeight: 600 }}>0.95 mg/dL</td>
                  <td style={{ padding: '6px', color: '#64748b' }}>0.7 - 1.2 mg/dL</td>
                  <td style={{ padding: '6px', color: '#10b981', fontWeight: 700 }}>NORMAL</td>
                </tr>
              </tbody>
            </table>

            <div style={{ fontSize: '9px', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Automatic OCR extraction verified against LOINC standard terminology</span>
              <span>Confidence: 98.4%</span>
            </div>
          </div>
        )}

        {/* Dynamic Coordinate Bounding Boxes */}
        {state.showOverlays && !state.loading && state.scanResult?.visual_bounding_boxes?.map((box: any, i: number) => {
          const isSelected = state.selectedBoxIndex === i;
          return (
            <div
              key={i}
              onClick={(e) => { e.stopPropagation(); state.setSelectedBoxIndex(isSelected ? null : i); }}
              style={{
                position: 'absolute',
                left: `${box.box.x}%`,
                top: `${box.box.y}%`,
                width: `${box.box.width}%`,
                height: `${box.box.height}%`,
                border: `${isSelected ? '3px' : '2px'} dashed ${box.color || '#ef4444'}`,
                backgroundColor: `${box.color || '#ef4444'}${isSelected ? '35' : '15'}`,
                boxSizing: 'border-box',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '4px',
                left: '4px',
                background: box.color || '#ef4444',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
                pointerEvents: 'none'
              }}>
                {translateText(box.label)} ({Math.round(box.confidence * 100)}%)
              </div>
            </div>
          );
        })}

        {/* Loading Shimmer */}
        {state.loading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#db2777',
            fontSize: '13px',
            fontWeight: 800,
            gap: '10px'
          }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #db2777', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <div>{t('scan_running_engine', 'Running AI Detection Engine...')}</div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        <button
          onClick={() => state.handleAnalyzeScan(state.modality)}
          disabled={state.loading}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '10px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '12px',
            border: 'none',
            cursor: state.loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
          }}
        >
          <RefreshCw size={14} />
          {state.loading ? t('scan_processing', 'Processing Visualizer...') : t('scan_rerun_detection', 'Re-Run Detection Engine')}
        </button>

        {state.uploadedImagePreview && (
          <button
            onClick={() => {
              state.setUploadedImagePreview(null);
              state.setUploadedFileName(null);
              state.setSelectedBoxIndex(null);
              state.handleAnalyzeScan(state.modality);
            }}
            style={{
              padding: '12px 18px',
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              color: '#64748b',
              fontWeight: 800,
              fontSize: '12px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer'
            }}
          >
            {t('scan_reset', 'Reset')}
          </button>
        )}
      </div>
    </div>
  );
}
