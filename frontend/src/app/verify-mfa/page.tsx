'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Loader, AlertCircle } from 'lucide-react';

const medicalSlides = [
  {
    img: '/images/medical/agent_swarm_doctors.jpg',
    badge: 'AIIMS & Swarm Consensus',
    title: 'Autonomous Clinical Intelligence,\nEmpowering Care Teams',
  },
  {
    img: '/images/medical/triage_doctor_patient.jpg',
    badge: 'Instant Emergency Triage',
    title: 'Rapid Clinical Consensus,\nSaving Critical Minutes',
  },
  {
    img: '/images/medical/scan_radiologist_diagnostic.jpg',
    badge: 'Diagnostic Scan Intelligence',
    title: 'Sub-Second Radiologic AI,\nVerified Clinical Standards',
  },
];

function VerifyMfaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const redirectTarget = searchParams.get('redirect') || '/orchestrator-agent';

  const { verifyMFALogin } = useAuth();

  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  // Carousel slide index
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % medicalSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePinChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);

    if (digit && index < 5) {
      const nextInput = document.getElementById(`verify-pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`verify-pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePinPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;
    const newPin = [...pin];
    for (let i = 0; i < 6; i++) {
      newPin[i] = pastedData[i] || '';
    }
    setPin(newPin);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullPin = pin.join('');
    if (fullPin.length < 6) {
      setError('Your one-time password must be 6 characters.');
      return;
    }

    if (!email) {
      router.replace('/login');
      return;
    }

    setError(null);
    setIsPending(true);

    try {
      const res = await verifyMFALogin(email, fullPin);
      setIsPending(false);

      if (!res.success) {
        setError(res.error || 'Invalid 6-digit verification code.');
        return;
      }

      router.replace(redirectTarget);
    } catch (err: any) {
      setIsPending(false);
      setError(err.message || 'Verification error');
    }
  };

  return (
    <div className="auth-root w-full min-h-screen flex flex-col md:flex-row bg-[#f8fafc] text-[#0f172a]" style={{ opacity: 1, visibility: 'visible' }}>
      {/* Left Panel - Hospital & Medicine Hero matching Sanjeevni OS */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 relative p-8 flex-col justify-between overflow-hidden m-4 rounded-3xl shadow-xl bg-slate-900">
        {/* Layered Crossfade Images */}
        {medicalSlides.map((slide, idx) => (
          <div
            key={idx}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `url('${slide.img}')`,
              opacity: activeSlide === idx ? 1 : 0,
              zIndex: activeSlide === idx ? 1 : 0,
            }}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/85 z-10 pointer-events-none" />

        {/* Logo / Top Bar */}
        <div className="relative z-20 flex justify-between items-center w-full">
          <div className="flex items-center gap-2.5 text-white">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center p-1.5 backdrop-blur-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full text-emerald-400 fill-current">
                <path d="M 34.5 33.5 A 11.5 11.5 0 0 0 23.5 44 A 11.5 11.5 0 0 0 34.5 54.5 C 42 54.5, 47 59, 49 66 C 49 71.5, 48.5 75, 48.5 75.5 A 11.5 11.5 0 0 0 60 87 A 11.5 11.5 0 0 0 71.5 75.5 C 71.5 75, 71 71.5, 71 66 C 73 59, 78 54.5, 85.5 54.5 A 11.5 11.5 0 0 0 96.5 44 A 11.5 11.5 0 0 0 85.5 33.5 C 77 33.5, 68 40, 60 50 C 52 40, 43 33.5, 34.5 33.5 Z" />
                <circle cx="60" cy="24" r="9" />
                <circle cx="36" cy="74" r="9" />
                <circle cx="84" cy="74" r="9" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-wider text-white">SANJEEVNI</span>
          </div>
          <Link 
            href="/"
            className="text-white/90 hover:text-white text-xs font-semibold bg-white/20 hover:bg-white/30 px-3.5 py-1.5 rounded-full backdrop-blur-md transition-all"
          >
            Back to website &rarr;
          </Link>
        </div>

        {/* Bottom Text & Carousel Indicators */}
        <div className="relative z-20 w-full pb-6">
          <div className="inline-block bg-[#7e57c2]/80 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-widest mb-3">
            {medicalSlides[activeSlide].badge}
          </div>
          <h2 className="text-white text-3xl font-semibold tracking-tight leading-snug whitespace-pre-line drop-shadow-md">
            {medicalSlides[activeSlide].title}
          </h2>
          <div className="flex gap-2 mt-6">
            {medicalSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSlide(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  activeSlide === idx ? 'w-8 bg-white' : 'w-4 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form (Guaranteed 100% visible, no opacity:0 bug) */}
      <div className="w-full md:w-1/2 lg:w-7/12 flex items-center justify-center p-6 md:p-12">
        <div 
          className="w-full max-w-[440px] bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-200/80"
          style={{ opacity: 1, visibility: 'visible', color: '#0f172a' }}
        >
          <div className="w-full" style={{ opacity: 1, visibility: 'visible' }}>
            <h1 
              className="text-2xl tracking-tight font-bold mb-2 text-center sm:text-left"
              style={{ color: '#0f172a' }}
            >
              Verify Two-Factor Auth
            </h1>
            <p className="text-sm text-slate-500 mb-6 text-center sm:text-left">
              Enter the 6-digit code from your authenticator app
              {email ? <> for <strong className="text-[#0f172a]">{email}</strong></> : '.'}
            </p>

            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ opacity: 1, visibility: 'visible' }}>
              <div className="flex gap-2 justify-center mb-6" onPaste={handlePinPaste}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    id={`verify-pin-${index}`}
                    type="text"
                    maxLength={1}
                    inputMode="numeric"
                    value={pin[index]}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(index, e)}
                    className="w-11 h-12 text-center text-xl font-bold bg-[#f8fafc] border border-slate-300 text-[#0f172a] rounded-lg focus:outline-none focus:border-[#7e57c2] focus:ring-2 focus:ring-[#7e57c2]/20 transition-all"
                    style={{ color: '#0f172a', fontSize: '20px', padding: '0', borderRadius: '8px', borderWidth: '1px' }}
                  />
                ))}
              </div>

              <button
                disabled={isPending || pin.join('').length < 6}
                type="submit"
                className="w-full text-[15px] h-11 bg-[#7e57c2] hover:bg-[#6847a3] text-white rounded-lg font-semibold transition-colors flex items-center justify-center cursor-pointer shadow-md shadow-[#7e57c2]/20 disabled:opacity-50"
                style={{ backgroundColor: '#7e57c2', color: '#ffffff', fontSize: '15px', borderRadius: '8px', border: 'none' }}
              >
                {isPending && <Loader className="animate-spin mr-2 w-4 h-4" />}
                Confirm & Authenticate
              </button>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors"
                >
                  &larr; Back to login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyMfaPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen flex items-center justify-center bg-[#f8fafc] text-slate-700">
        <Loader size={32} className="animate-spin text-[#7e57c2]" />
      </div>
    }>
      <VerifyMfaContent />
    </Suspense>
  );
}
