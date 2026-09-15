import React from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import PrescriptionOCRView from './PrescriptionOCRView';

export default function ScanResults({ state }: { state: any }) {
  const { translateText } = useLanguage();

  if (state.modality === 'prescription') {
    return <PrescriptionOCRView state={state} />;
  }

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
      
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', fontWeight: 800 }}>
            {translateText('Interpretation Summary')}
          </span>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7', background: '#f0f9ff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bae6fd' }}>
            {translateText(state.scanResult?.urgency_badge || 'PENDING')}
          </span>
        </div>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: 800, lineHeight: '1.4' }}>
          {translateText(state.scanResult?.ai_diagnosis_summary || 'Analyzing Document...')}
        </h3>
      </div>

      {/* Plain Language / Patient-Friendly Explanation */}
      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', marginBottom: '8px' }}>
          {translateText('Patient-Friendly Explanation')}
        </div>
        <p style={{ margin: 0, fontSize: '13.5px', color: '#334155', lineHeight: '1.6' }}>
          {translateText(state.scanResult?.plain_english_explanation || 'Processing plain-language summary...')}
        </p>
      </div>

      {/* Remote YOLOv8 Visualizations from Hugging Face Space */}
      {(state.scanResult?.remote_result_image || state.scanResult?.remote_gradcam_image) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {state.scanResult.remote_result_image && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', marginBottom: '8px' }}>
                🎯 {translateText('YOLOv8 Anomaly Localization')}
              </div>
              <img
                src={state.scanResult.remote_result_image}
                alt="YOLOv8 Detection"
                style={{ width: '100%', borderRadius: '8px', objectFit: 'contain', maxHeight: '240px', background: '#000000' }}
              />
            </div>
          )}
          {state.scanResult.remote_gradcam_image && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#db2777', textTransform: 'uppercase', marginBottom: '8px' }}>
                🔥 {translateText('Grad-CAM Attention Heatmap')}
              </div>
              <img
                src={state.scanResult.remote_gradcam_image}
                alt="Grad-CAM Activation"
                style={{ width: '100%', borderRadius: '8px', objectFit: 'contain', maxHeight: '240px', background: '#000000' }}
              />
            </div>
          )}
        </div>
      )}

      {/* Clinical Observations */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
          {translateText('Extracted Clinical Observations')} ({state.scanResult?.clinical_findings?.length || 0})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {state.scanResult?.clinical_findings?.map((f: string, idx: number) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#1e293b', background: '#ffffff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{translateText(f)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Doctor Questions */}
      {state.scanResult?.suggested_questions_for_doctor?.length > 0 && (
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', marginBottom: '10px' }}>
            {translateText('Recommended Questions for Your Doctor')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {state.scanResult.suggested_questions_for_doctor.map((q: string, idx: number) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12.5px', color: '#475569' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', flexShrink: 0, marginTop: '1px' }}>
                  ?
                </div>
                <span>{translateText(q)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ fontSize: '11px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
        <Info size={14} style={{ flexShrink: 0 }} />
        <span>{translateText('Visualizer demonstration output. Not a substitute for formal diagnostic radiologist review.')}</span>
      </div>
    </div>
  );
}
