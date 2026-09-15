'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Laptop, 
  Smartphone, 
  Trash2, 
  Loader, 
  Check, 
  Copy, 
  X,
  RefreshCw,
  LogOut
} from 'lucide-react';

export default function SecuritySessionsPanel() {
  const { 
    user, 
    sessions, 
    isSessionsLoading, 
    refreshSessions, 
    revokeSession, 
    setupMFA, 
    verifyMFASetup, 
    revokeMFA,
    logout
  } = useAuth();

  // MFA Setup Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mfaData, setMfaData] = useState<{ secret: string; qrImageUrl: string } | null>(null);
  const [isMfaLoading, setIsMfaLoading] = useState(false);
  const [isVerifyPending, setIsVerifyPending] = useState(false);
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [mfaError, setMfaError] = useState<string | null>(null);

  // Revoke MFA State
  const [isRevokePending, setIsRevokePending] = useState(false);

  // Delete Session State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const currentSession = sessions.find((s) => s.isCurrent);
  const otherSessions = sessions.filter((s) => !s.isCurrent);

  const handleOpenMfa = async () => {
    setIsMfaLoading(true);
    setMfaError(null);
    setPin(['', '', '', '', '', '']);
    setShowKey(false);
    const data = await setupMFA();
    setIsMfaLoading(false);
    if (data) {
      setMfaData(data);
      setIsOpen(true);
    }
  };

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handlePinChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const nextPin = [...pin];
    nextPin[index] = digit;
    setPin(nextPin);

    if (digit && index < 5) {
      const el = document.getElementById(`mfa-slot-${index + 1}`);
      el?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const el = document.getElementById(`mfa-slot-${index - 1}`);
      el?.focus();
    }
  };

  const handleVerifyMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullPin = pin.join('');
    if (fullPin.length < 6) {
      setMfaError('Your one-time password must be 6 characters.');
      return;
    }

    setIsVerifyPending(true);
    setMfaError(null);

    const res = await verifyMFASetup(fullPin, mfaData?.secret);
    setIsVerifyPending(false);

    if (res.success) {
      setIsOpen(false);
    } else {
      setMfaError(res.error || 'Invalid MFA code. Please try again.');
    }
  };

  const handleRevokeMfa = async () => {
    setIsRevokePending(true);
    await revokeMFA();
    setIsRevokePending(false);
  };

  const handleDeleteSession = async (id: string) => {
    setDeletingId(id);
    await revokeSession(id);
    setDeletingId(null);
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '24px 16px',
      fontFamily: '"Times New Roman", Times, serif',
      color: '#0f172a',
    }}>
      {/* Header matching MERN Auth Home */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{
            fontSize: '28px',
            lineHeight: '34px',
            letterSpacing: '-0.416px',
            color: '#000509e3',
            fontWeight: 800,
            margin: 0,
          }}>
            Setup security and sessions
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => refreshSessions()}
              disabled={isSessionsLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              <RefreshCw size={13} className={isSessionsLoading ? 'animate-spin' : ''} />
              <span>Sync</span>
            </button>
            <button
              onClick={() => logout()}
              title="Sign out of Sanjeevni OS"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                background: '#fef2f2',
                fontSize: '13px',
                fontWeight: 600,
                color: '#dc2626',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(220, 38, 38, 0.05)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fee2e2';
                e.currentTarget.style.borderColor = '#fca5a5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fef2f2';
                e.currentTarget.style.borderColor = '#fecaca';
              }}
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
        <p style={{
          fontSize: '14px',
          color: '#0007149f',
          marginTop: '6px',
          marginBottom: 0,
        }}>
          Follow the steps to activate using Sanjeevni OS.
        </p>
      </div>

      {/* Timeline Steps Layout */}
      <div style={{ position: 'relative', paddingLeft: '32px' }}>
        {/* Step Gradient Timeline Line */}
        <div style={{
          position: 'absolute',
          left: '11px',
          top: '20px',
          bottom: '20px',
          width: '2px',
          background: 'linear-gradient(180deg, #7e57c2 0%, #cbd5e1 50%, transparent 100%)',
        }} />

        {/* STEP 1: Enable MFA Card */}
        <div style={{ position: 'relative', marginBottom: '32px' }}>
          {/* Step Bullet Dot */}
          <div style={{
            position: 'absolute',
            left: '-32px',
            top: '24px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#ffffff',
            border: '2px solid #7e57c2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 0 4px rgba(126, 87, 194, 0.15)',
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7e57c2' }} />
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#0f172a',
                letterSpacing: '-0.16px',
                margin: 0,
              }}>
                Multi-Factor Authentication (MFA)
              </h3>
              {user?.userPreferences?.enable2FA && (
                <span style={{
                  background: '#dcfce7',
                  color: '#15803d',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '2px 10px',
                  borderRadius: '12px',
                }}>
                  Enabled
                </span>
              )}
            </div>

            <p style={{
              fontSize: '14px',
              color: '#0007149f',
              margin: '0 0 24px 0',
            }}>
              Protect your account by adding an extra layer of security.
            </p>

            {user?.userPreferences?.enable2FA ? (
              <button
                disabled={isRevokePending}
                onClick={handleRevokeMfa}
                style={{
                  height: '38px',
                  padding: '0 20px',
                  color: '#c40006',
                  background: '#fee2e2',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'background 0.2s',
                }}
              >
                {isRevokePending && <Loader size={15} className="animate-spin" />}
                <span>Revoke Access</span>
              </button>
            ) : (
              <button
                disabled={isMfaLoading}
                onClick={handleOpenMfa}
                style={{
                  height: '38px',
                  padding: '0 20px',
                  background: '#7e57c2',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(126, 87, 194, 0.3)',
                  transition: 'background 0.2s',
                }}
              >
                {isMfaLoading && <Loader size={15} className="animate-spin" />}
                <span>Enable MFA</span>
              </button>
            )}
          </div>
        </div>

        {/* STEP 2: Sessions Card */}
        <div style={{ position: 'relative' }}>
          {/* Step Bullet Dot */}
          <div style={{
            position: 'absolute',
            left: '-32px',
            top: '24px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#ffffff',
            border: '2px solid #7e57c2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 0 4px rgba(126, 87, 194, 0.15)',
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7e57c2' }} />
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '-0.16px',
              margin: '0 0 6px 0',
            }}>
              Sessions
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#0007149f',
              margin: '0 0 24px 0',
              lineHeight: 1.5,
              maxWidth: '640px',
            }}>
              Sessions are the devices you are using or that have used your Sanjeevni OS account. These are the sessions where your account is currently logged in. You can log out of each session.
            </p>

            {isSessionsLoading && sessions.length === 0 ? (
              <div style={{ padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader size={30} className="animate-spin text-[#7e57c2]" />
              </div>
            ) : (
              <div style={{ maxWidth: '640px' }}>
                {/* Current Active Session Subheading */}
                <div style={{ marginBottom: '12px' }}>
                  <h5 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '0 0 4px 0' }}>
                    Current active session
                  </h5>
                  <p style={{ fontSize: '13px', color: '#0007149f', margin: 0 }}>
                    You’re logged into this Sanjeevni OS account on this device and are currently using it.
                  </p>
                </div>

                {/* Current Session Item */}
                {currentSession && (
                  <div style={{
                    padding: '16px 0',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '16px',
                      color: '#475569',
                      flexShrink: 0,
                    }}>
                      {currentSession.deviceType.includes('Mobile') ? <Smartphone size={22} /> : <Laptop size={22} />}
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: '0 0 4px 0' }}>
                          {currentSession.os} / {currentSession.browser}
                        </h5>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(34, 197, 94, 0.85)',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 600,
                          height: '20px',
                          padding: '0 8px',
                          borderRadius: '6px',
                        }}>
                          Active now
                        </div>
                      </div>

                      {/* Terminate Current Session / Logout */}
                      <button
                        onClick={() => logout()}
                        title="Sign out of this session"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: '1px solid #fecaca',
                          background: '#fef2f2',
                          color: '#dc2626',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#fee2e2';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#fef2f2';
                        }}
                      >
                        <LogOut size={13} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Other Sessions Subheading */}
                <div style={{ marginTop: '24px' }}>
                  <h5 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '0 0 12px 0' }}>
                    Other sessions
                  </h5>
                  {otherSessions.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                      No other devices or sessions are active.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {otherSessions.map((session) => (
                        <div
                          key={session.id}
                          style={{
                            padding: '12px 0',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              border: '1px solid #e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: '16px',
                              color: '#475569',
                              flexShrink: 0,
                            }}>
                              {session.deviceType.includes('Mobile') ? <Smartphone size={22} /> : <Laptop size={22} />}
                            </div>
                            <div>
                              <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: '0 0 2px 0' }}>
                                {session.os} / {session.browser}
                              </h5>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>
                                {session.formattedDate}
                              </span>
                            </div>
                          </div>

                          <button
                            disabled={deletingId === session.id}
                            onClick={() => handleDeleteSession(session.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#64748b',
                              cursor: 'pointer',
                              padding: '8px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Log out of this session"
                          >
                            {deletingId === session.id ? (
                              <Loader size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: Setup Multi-Factor Authentication Dialog */}
      {isOpen && mfaData && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '440px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            position: 'relative',
          }}>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                right: '16px',
                top: '16px',
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 12px 0' }}>
              Setup Multi-Factor Authentication
            </h3>

            <div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '12px 0 4px 0' }}>
                Scan the QR code
              </p>
              <span style={{ fontSize: '13px', color: '#475569', lineHeight: 1.4, display: 'block' }}>
                Use an app like{' '}
                <a
                  href="https://support.1password.com/one-time-passwords/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#7e57c2', textDecoration: 'underline' }}
                >
                  1Password
                </a>{' '}
                or{' '}
                <a
                  href="https://safety.google/authentication/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#7e57c2', textDecoration: 'underline' }}
                >
                  Google Authenticator
                </a>{' '}
                to scan the QR code below.
              </span>
            </div>

            <div style={{
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}>
              <div style={{
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                padding: '8px',
                background: '#ffffff',
                flexShrink: 0,
              }}>
                <img
                  src={mfaData.qrImageUrl}
                  alt="QR code"
                  style={{ width: '140px', height: '140px', display: 'block' }}
                />
              </div>

              {showKey ? (
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                    <span>Copy setup key</span>
                    <button
                      onClick={() => handleCopy(mfaData.secret)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: copied ? '#15803d' : '#64748b' }}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p style={{
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    color: '#0f172a',
                    fontWeight: 600,
                    margin: '4px 0 0 0',
                    wordBreak: 'break-all',
                  }}>
                    {mfaData.secret}
                  </p>
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  <span>Can't scan the code?</span>
                  <button
                    onClick={() => setShowKey(true)}
                    style={{
                      display: 'block',
                      color: '#7e57c2',
                      background: 'none',
                      border: 'none',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: 0,
                      marginTop: '4px',
                      fontWeight: 500,
                    }}
                  >
                    View the Setup Key
                  </button>
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <form onSubmit={handleVerifyMfaSubmit}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                  Then enter the code
                </label>

                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '12px' }}>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      id={`mfa-slot-${index}`}
                      type="text"
                      maxLength={1}
                      inputMode="numeric"
                      value={pin[index]}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(index, e)}
                      style={{
                        width: '44px',
                        height: '48px',
                        textAlign: 'center',
                        fontSize: '18px',
                        fontWeight: 700,
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        outline: 'none',
                        color: '#0f172a',
                      }}
                    />
                  ))}
                </div>

                {mfaError && (
                  <p style={{ color: '#dc2626', fontSize: '12px', textAlign: 'center', margin: '0 0 10px 0' }}>
                    {mfaError}
                  </p>
                )}

                <button
                  disabled={isVerifyPending || pin.join('').length < 6}
                  type="submit"
                  style={{
                    width: '100%',
                    height: '40px',
                    background: '#7e57c2',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: (isVerifyPending || pin.join('').length < 6) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    opacity: (isVerifyPending || pin.join('').length < 6) ? 0.6 : 1,
                  }}
                >
                  {isVerifyPending && <Loader size={16} className="animate-spin" />}
                  <span>Verify</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
