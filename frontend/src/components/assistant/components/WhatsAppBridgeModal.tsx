import React from 'react';

interface WhatsAppBridgeModalProps {
  waPhoneNumber?: string;
  setWaPhoneNumber?: (val: string) => void;
  waConnected?: boolean;
  waMetaToken?: string;
  setWaMetaToken?: (val: string) => void;
  waWebhookUrl?: string;
  setWaWebhookUrl?: (val: string) => void;
  waAutoSyncReports?: boolean;
  setWaAutoSyncReports?: (val: boolean) => void;
  waDailyReminders?: boolean;
  setWaDailyReminders?: (val: boolean) => void;
  onSaveWhatsApp?: (e: React.FormEvent) => void;
  onSimulateInbound?: () => void;
}

export default function WhatsAppBridgeModal({
  waConnected = true,
  onSimulateInbound
}: WhatsAppBridgeModalProps) {
  const whatsappUrl = "https://wa.me/15552028141?text=Hi%20Sanjeevni";

  return (
    <div 
      data-lenis-prevent="true"
      className="synapseos-custom-scroll"
      onWheel={(e) => e.stopPropagation()}
      style={{
        flex: 1,
        padding: '24px 20px',
        overflowY: 'auto',
        background: 'rgba(255, 255, 255, 0.98)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '18px',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Header Badge */}
      <div style={{ width: '100%', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          borderRadius: '20px',
          background: '#dcfce7',
          border: '1px solid #86efac',
          color: '#15803d',
          fontSize: '11.5px',
          fontWeight: 700,
          marginBottom: '8px'
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          <span>Sanjeevni WhatsApp Copilot</span>
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.2px', margin: '0 0 4px 0' }}>
          Scan to Chat on WhatsApp
        </h3>
        <p style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.4, margin: '0 auto', maxWidth: '340px' }}>
          Scan the QR code below or tap the direct button to launch instant AI symptom triage on your phone.
        </p>
      </div>

      {/* Clean Single QR Code Card */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #22c55e',
        borderRadius: '20px',
        padding: '16px',
        boxShadow: '0 12px 32px rgba(34, 197, 94, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        position: 'relative'
      }}>
        <div style={{
          width: '210px',
          height: '210px',
          background: '#ffffff',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}>
          <img 
            src="/whatsapp-qr.svg"
            alt="Scan to Chat on WhatsApp"
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }}
            onError={(e) => {
              // Fallback to PNG if SVG fails
              (e.target as HTMLImageElement).src = '/whatsapp-qr.png';
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#15803d'
        }}>
          <span>📷</span>
          <span>Point camera or WhatsApp scanner here</span>
        </div>
      </div>

      {/* Direct Open in WhatsApp Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          width: '100%',
          maxWidth: '320px',
          padding: '12px 18px',
          borderRadius: '12px',
          background: '#25D366',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '13.5px',
          textAlign: 'center',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 4px 16px rgba(37, 211, 102, 0.35)',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#1ebd5a';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#25D366';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.073-2.115-.494-1.745-.698-2.871-2.483-2.958-2.6-.087-.116-.708-.94-0.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.108.005.25-.041.391.298.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.182-.076.355.101.173.45 0.742.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.679.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.419-.101.824z"/>
        </svg>
        <span>Open in WhatsApp (+1 555-202-8141)</span>
      </a>

      {/* Direct link label */}
      <span style={{ fontSize: '11px', color: '#64748b' }}>
        Pre-filled message: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#0f172a', fontWeight: 600 }}>Hi Sanjeevni</code>
      </span>

      {/* 3 Steps Guide */}
      <div style={{
        width: '100%',
        maxWidth: '340px',
        background: '#f8fafc',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          How it works
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11.5px', color: '#334155' }}>
          <span style={{ fontWeight: 800, color: '#16a34a' }}>1.</span>
          <span>Scan the QR code with phone camera or tap the button above</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11.5px', color: '#334155' }}>
          <span style={{ fontWeight: 800, color: '#16a34a' }}>2.</span>
          <span>Send <b>&quot;Hi Sanjeevni&quot;</b> to start your triage consultation</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11.5px', color: '#334155' }}>
          <span style={{ fontWeight: 800, color: '#16a34a' }}>3.</span>
          <span>Get instant clinical evaluation, Indian OTC relief, and 108 red-flag warnings</span>
        </div>
      </div>

      {/* Simulation Option for Devs / Demos */}
      {onSimulateInbound && (
        <button
          type="button"
          onClick={onSimulateInbound}
          style={{
            marginTop: '4px',
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: '11px',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          🧪 Demo: Simulate Inbound WhatsApp Prescription
        </button>
      )}
    </div>
  );
}
