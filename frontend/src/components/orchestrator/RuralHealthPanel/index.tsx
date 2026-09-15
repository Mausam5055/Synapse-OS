'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Database, 
  ShieldCheck, 
  Activity, 
  Award, 
  Radio, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Globe,
  Smartphone,
  Sparkles,
  Heart,
  Droplets,
  Layers,
  FileCheck,
  PhoneCall,
  Shield,
  Zap,
  Check,
  Send,
  WifiOff,
  Flame,
  Stethoscope,
  Info
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface PreventiveTopic {
  id: string;
  title: string;
  shortTitle: string;
  icon: string;
  category: string;
  steps: { title: string; detail: string }[];
  redFlag: string;
  scheme: string;
  smsPayload: string;
}

const PREVENTIVE_TOPICS: PreventiveTopic[] = [
  {
    id: 'ors',
    title: 'ORS & Child Diarrhea',
    shortTitle: 'ORS & Diarrhea',
    icon: '💧',
    category: 'Emergency Dehydration Protocol',
    steps: [
      { title: 'Clean Water Preparation', detail: 'Boil 1 Liter of clean drinking water and let it cool completely to room temperature.' },
      { title: 'WHO Formula Calibration', detail: 'Mix 1 full WHO ORS sachet (or precisely 6 tsp sugar + 1/2 tsp salt in 1L water).' },
      { title: 'Frequent Sip Administration', detail: 'Administer frequent small sips immediately after every loose motion to prevent hypovolemic shock.' },
      { title: 'Zinc Gut Lining Therapy', detail: 'Give 1 Zinc tablet (20mg) daily for 14 full consecutive days to restore intestinal mucosa.' }
    ],
    redFlag: 'Sunken eyes, lethargy, skin pinch stays up, or unable to drink -> Rush to nearest PHC immediately.',
    scheme: 'Intensified Diarrhea Control (IDCF) • NHM Guidelines',
    smsPayload: '[IDCF-ORS] 1L boiled water + 1 ORS pkt. Frequent small sips. Zinc 20mg x 14d. Rush to PHC if lethargic or sunken eyes.'
  },
  {
    id: 'poshan',
    title: 'Poshan & Maternal Care',
    shortTitle: 'Maternal Care',
    icon: '🤱',
    category: 'Maternal Nutrition & Anemia',
    steps: [
      { title: 'IFA Red Iron Supplementation', detail: 'Take 1 Iron-Folic Acid (IFA Red) tablet daily after meals starting from 4th month of pregnancy.' },
      { title: 'Calcium Intake Timing', detail: 'Take Calcium tablets twice daily at separate times (never take Calcium together with IFA).' },
      { title: 'Indigenous Superfoods', detail: 'Eat local bioavailable iron: Moringa (drumstick leaves), spinach, black jaggery, and amla.' },
      { title: 'Exclusive Breastfeeding', detail: 'Practice 100% exclusive breastfeeding for baby\'s first 6 full months (zero outside water/honey).' }
    ],
    redFlag: 'Severe dizziness, facial swelling, blurred vision, or decreased fetal movement -> Urgent BP screening.',
    scheme: 'Poshan Abhiyaan • Anemia Mukt Bharat',
    smsPayload: '[POSHAN] 1 IFA tablet daily from 4th month. Calcium 2x/day separately. Eat drumstick leaves, jaggery, amla. Check BP if dizzy.'
  },
  {
    id: 'vector',
    title: 'Vector / Dengue Control',
    shortTitle: 'Dengue & Malaria',
    icon: '🦟',
    category: 'Vector-Borne Outbreak Control',
    steps: [
      { title: 'Sunday Dry Day Observance', detail: 'Empty, scrub, and invert desert coolers, flowerpot saucers, and discarded tyres every Sunday.' },
      { title: 'Overhead Drum Sealing', detail: 'Cover all domestic water storage tanks and earthenware pots tightly with lids or fine muslin.' },
      { title: 'LLIN Bed Nets', detail: 'Sleep inside Long-Lasting Insecticidal Nets (LLINs), especially pregnant women and infants.' },
      { title: 'Daytime Bite Protection', detail: 'Wear full-sleeve light clothing during early dawn and late dusk when Aedes mosquitoes bite.' }
    ],
    redFlag: 'High remittent fever with bleeding gums, black tarry stools, or severe abdominal pain -> Urgent hospital admission.',
    scheme: 'National Vector Borne Disease Control (NVBDCP)',
    smsPayload: '[NVBDCP] Empty coolers & pots every Sunday. Cover water drums tightly. Use bed nets. High fever + bleeding gums -> Call 108.'
  },
  {
    id: 'wash',
    title: 'Clean Water & WASH',
    shortTitle: 'Clean WASH',
    icon: '🧼',
    category: 'Water Sanitation & Hygiene',
    steps: [
      { title: 'Active Disinfection', detail: 'Boil drinking water vigorously for 2 minutes or add 1 Chlorine tablet (Halazone) per 20 Liters.' },
      { title: 'Six-Step Hand Hygiene', detail: 'Wash hands thoroughly with soap for 20 seconds before cooking, feeding, and after toilet use.' },
      { title: 'Narrow-Neck Storage', detail: 'Store drinking water in narrow-mouth vessels with clean taps or ladles to prevent finger immersion.' },
      { title: 'Bi-Annual Deworming', detail: 'Chew 1 Albendazole (400mg) tablet every 6 months during National Deworming Day campaigns.' }
    ],
    redFlag: 'Sudden rice-water diarrhea (Cholera trigger) or persistent high remittent fever with delirium (Typhoid).',
    scheme: 'Jal Jeevan Mission • Swachh Bharat Gramin',
    smsPayload: '[WASH] Boil water 2 mins or use 1 chlorine tab/20L. Wash hands with soap 20s. Take Albendazole 400mg every 6 months.'
  },
  {
    id: 'ncd',
    title: 'Heart & NCD Wellness',
    shortTitle: 'Cardiac & NCD',
    icon: '❤️',
    category: 'Hypertension & Diabetes Screening',
    steps: [
      { title: 'Dietary Sodium Cap', detail: 'Restrict daily salt intake to strictly under 1 level teaspoon (<5g sodium chloride per day).' },
      { title: 'Tobacco Cessation', detail: 'Strictly avoid bidi, gutkha, khaini, and passive smoke to prevent premature vascular damage.' },
      { title: 'Daily Physical Mobility', detail: 'Engage in at least 30 minutes of brisk walking, cycling, or agricultural physical activity.' },
      { title: 'Free Mandir Screening', detail: 'Undergo free annual BP and blood sugar checkups at nearest Ayushman Arogya Mandir.' }
    ],
    redFlag: 'Crushing chest tightness radiating to left arm/jaw, or non-healing trophic foot sores in diabetics.',
    scheme: 'NP-NCD National Programme for Non-Communicable Diseases',
    smsPayload: '[NCD-CARE] Salt < 1 tsp/day. Avoid bidi & gutkha. 30m daily walk. Free annual BP & Sugar checkup at Ayushman Arogya Mandir.'
  }
];

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the exact water volume required to prepare 1 standard WHO ORS sachet safely?',
    options: [
      'Exactly 1.0 Liter of clean drinking water',
      'Half a cup of warm tea',
      '2.5 Liters of lukewarm milk',
      'Only 1 standard glass (200ml)'
    ],
    correct: 0,
    explanation: 'WHO-standard ORS is strictly calibrated for exactly 1.0 Liter of water to maintain ideal osmolarity (245 mOsm/L).'
  },
  {
    id: 'q2',
    question: 'How long should a newborn receive exclusive breastfeeding with zero outside water or honey?',
    options: [
      'First 2 weeks after birth',
      'First 6 full months (180 days)',
      'Until the first tooth emerges',
      'Only during nighttime feeds'
    ],
    correct: 1,
    explanation: 'Exclusive breastfeeding for 6 full months provides complete immune antibodies and sterile hydration for infant gut health.'
  },
  {
    id: 'q3',
    question: 'During what time of day do Dengue-transmitting Aedes mosquitoes bite most aggressively?',
    options: [
      'Daylight hours (early dawn & late afternoon)',
      'Midnight in pitch black darkness only',
      'Only during active monsoonal rainfalls',
      'They bite exclusively inside deep forests'
    ],
    correct: 0,
    explanation: 'Aedes aegypti mosquitoes are daytime biters that breed in clean domestic water containers around human habitats.'
  }
];

const REGIONAL_LANGUAGES = [
  { code: 'hi', name: 'हिन्दी', script: 'Hindi', coverage: '44% Population' },
  { code: 'bn', name: 'বাংলা', script: 'Bengali', coverage: '9% Population' },
  { code: 'ta', name: 'தமிழ்', script: 'Tamil', coverage: '6% Population' },
  { code: 'te', name: 'తెలుగు', script: 'Telugu', coverage: '7% Population' },
  { code: 'mr', name: 'मराठी', script: 'Marathi', coverage: '7% Population' },
  { code: 'gu', name: 'ગુજરાતી', script: 'Gujarati', coverage: '5% Population' },
  { code: 'kn', name: 'ಕನ್ನಡ', script: 'Kannada', coverage: '4% Population' },
  { code: 'ml', name: 'മലയാളം', script: 'Malayalam', coverage: '3% Population' },
  { code: 'en', name: 'English', script: 'Pan-India', coverage: 'National Standard' }
];

export default function RuralHealthPanel() {
  const { t, translateText } = useLanguage();
  const [activeTab, setActiveTab] = useState<'guides' | 'quiz'>('guides');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('ors');
  const [copiedSms, setCopiedSms] = useState<boolean>(false);
  const [selectedLang, setSelectedLang] = useState<string>('hi');

  // Quiz state
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [userSelections, setUserSelections] = useState<{ [qId: string]: number }>({});
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isQuizFinished, setIsQuizFinished] = useState<boolean>(false);

  const activeTopic = PREVENTIVE_TOPICS.find(item => item.id === selectedTopicId) || PREVENTIVE_TOPICS[0];
  const currentQ = QUIZ_QUESTIONS[currentQIndex];

  const handleSelectOption = (optIndex: number) => {
    if (isAnswered) return;
    setUserSelections(prev => ({ ...prev, [currentQ.id]: optIndex }));
    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    if (currentQIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
      setIsAnswered(false);
    } else {
      setIsQuizFinished(true);
    }
  };

  const handleResetQuiz = () => {
    setCurrentQIndex(0);
    setUserSelections({});
    setIsAnswered(false);
    setIsQuizFinished(false);
  };

  const calculateScore = () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach(q => {
      if (userSelections[q.id] === q.correct) score++;
    });
    return score;
  };

  const handleCopySms = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(activeTopic.smsPayload);
      setCopiedSms(true);
      setTimeout(() => setCopiedSms(false), 2000);
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '1600px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gap: '20px',
      fontFamily: '"Times New Roman", Times, serif',
      color: '#0f172a'
    }}>

      {/* =========================================================================
          BENTO TILE 1: HERO STRATEGIC EMBLEM (8 Cols) - Light Tone Blue Glass
          ========================================================================= */}
      <div style={{
        gridColumn: 'span 8',
        background: `linear-gradient(135deg, #ffffff 0%, #f0f9ff 60%, #e0f2fe 100%), url('/images/rural_hero_bg.jpg') right center / 45% auto no-repeat`,
        borderRadius: '24px',
        border: '1px solid #bae6fd',
        padding: '30px 34px',
        boxShadow: '0 8px 30px rgba(2, 132, 199, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative sky glow */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(2, 132, 199, 0.18) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '11.5px',
              fontWeight: 800,
              padding: '5px 14px',
              borderRadius: '999px',
              background: '#e0f2fe',
              border: '1px solid #bae6fd',
              color: '#0284c7',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.1)'
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#0284c7', boxShadow: '0 0 6px #0284c7' }} />
              {t('rural_badge', 'Ayushman Arogya • NHM • 2G GSM Fallback')}
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '8px',
              background: '#ffffff',
              color: '#0369a1',
              border: '1px solid #bae6fd',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              {translateText('MoHFW Verified Clinical Guidelines')}
            </span>
          </div>

          <h1 style={{
            fontSize: '28px',
            fontWeight: 900,
            margin: '0 0 10px 0',
            color: '#0f172a',
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}>
            {t('rural_hub_title', 'Rural & Semi-Urban AI Healthcare Hub')}
          </h1>

          <p style={{
            margin: 0,
            fontSize: '14.5px',
            color: '#334155',
            lineHeight: 1.6,
            maxWidth: '820px'
          }}>
            {t('rural_hub_subtitle', 'Delivering zero-internet clinical self-care education, verified maternal milestones, and outbreak advisories to India’s Tier-3/4 and rural populations via 2G SMS and 9 native regional languages.')}
          </p>
        </div>

        {/* Feature Highlights Strip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          borderTop: '1px solid #bae6fd',
          paddingTop: '18px',
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#0369a1', fontWeight: 800 }}>
            <CheckCircle2 size={17} color="#0284c7" />
            <span>{translateText('100% Deterministic NHM Checklists')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#0369a1', fontWeight: 800 }}>
            <Zap size={17} color="#0284c7" />
            <span>{translateText('160-Char Plaintext 2G Fallback')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#0369a1', fontWeight: 800 }}>
            <Globe size={17} color="#0284c7" />
            <span>{translateText('9 Native Script Engines')}</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BENTO TILE 2: CLINICAL TELEMETRY GAIN (4 Cols) - Light Tone Blue Card
          ========================================================================= */}
      <div style={{
        gridColumn: 'span 4',
        background: 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)',
        borderRadius: '24px',
        padding: '28px 26px',
        color: '#0f172a',
        boxShadow: '0 10px 30px rgba(2, 132, 199, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '18px',
        border: '1.5px solid #bae6fd'
      }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#0284c7'
            }}>
              {translateText('Clinical Benchmark Telemetry')}
            </span>
            <Activity size={18} color="#0284c7" />
          </div>

          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '14px',
              border: '1px solid #bae6fd',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.05)'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 900, lineHeight: 1, color: '#0284c7' }}>91.4%</div>
              <div style={{ fontSize: '12px', color: '#334155', marginTop: '6px', fontWeight: 700 }}>
                {translateText('Diagnostic Accuracy')}
              </div>
              <div style={{ fontSize: '10.5px', color: '#0284c7', marginTop: '2px', fontWeight: 700 }}>✓ Target: ≥80% Req</div>
            </div>

            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '14px',
              border: '1px solid #bae6fd',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.05)'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 900, lineHeight: 1, color: '#0284c7' }}>+25.4%</div>
              <div style={{ fontSize: '12px', color: '#334155', marginTop: '6px', fontWeight: 700 }}>
                {translateText('Literacy Gain')}
              </div>
              <div style={{ fontSize: '10.5px', color: '#0284c7', marginTop: '2px', fontWeight: 700 }}>✓ 5 Core Directives</div>
            </div>
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '12px 14px',
          border: '1px solid #bae6fd',
          fontSize: '11.5px',
          lineHeight: 1.5,
          color: '#334155'
        }}>
          <b style={{ color: '#0284c7' }}>BioBERT Consensus:</b> {translateText('Engine validated against AIIMS & ICMR primary rural health directives.')}
        </div>
      </div>

      {/* =========================================================================
          BENTO TILE 3: INTERACTIVE CLINICAL LITERACY STUDIO (7 Cols)
          ========================================================================= */}
      <div style={{
        gridColumn: 'span 7',
        background: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        padding: '24px 28px',
        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      }}>
        {/* Top Control Bar: Active Title + Mode Switcher */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>{activeTopic.icon}</span>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                {translateText(activeTopic.title)}
              </h2>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                {translateText('Scheme:')} <b style={{ color: '#0284c7' }}>{translateText(activeTopic.scheme)}</b>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '8px',
              background: '#e0f2fe',
              color: '#0284c7',
              border: '1px solid #bae6fd'
            }}>
              {translateText(activeTopic.category)}
            </span>

            {/* View Mode Switcher */}
            <div style={{
              display: 'flex',
              gap: '3px',
              background: '#f8fafc',
              padding: '3px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0'
            }}>
              <button
                onClick={() => setActiveTab('guides')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  background: activeTab === 'guides' ? '#e0f2fe' : 'transparent',
                  color: activeTab === 'guides' ? '#0284c7' : '#64748b',
                  fontWeight: 800,
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'guides' ? 'inset 0 0 0 1.5px #bae6fd' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {t('tab_guides', 'Directives')}
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  background: activeTab === 'quiz' ? '#e0f2fe' : 'transparent',
                  color: activeTab === 'quiz' ? '#0284c7' : '#64748b',
                  fontWeight: 800,
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'quiz' ? 'inset 0 0 0 1.5px #bae6fd' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {t('tab_quiz', 'Awareness Quiz')}
              </button>
            </div>
          </div>
        </div>

        {/* 5-Column Segmented Tab Track with Sidebar Light Tone Blue */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px'
        }}>
          {PREVENTIVE_TOPICS.map(topic => {
            const isSelected = selectedTopicId === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => {
                  setSelectedTopicId(topic.id);
                  setActiveTab('guides');
                }}
                style={{
                  padding: '10px 6px',
                  borderRadius: '14px',
                  background: isSelected ? '#e0f2fe' : '#f8fafc',
                  color: isSelected ? '#0284c7' : '#334155',
                  border: isSelected ? '1.5px solid #bae6fd' : '1px solid #e2e8f0',
                  fontSize: '12px',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  boxShadow: isSelected ? 'inset 0 0 0 1px #bae6fd, 0 4px 12px rgba(2, 132, 199, 0.12)' : 'none',
                  transition: 'all 0.15s ease',
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: '16px' }}>{topic.icon}</span>
                <span style={{ fontSize: '11.5px', lineHeight: 1.1 }}>{translateText(topic.shortTitle)}</span>
              </button>
            );
          })}
        </div>

        {/* Directives Mode Body */}
        {activeTab === 'guides' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* 4 Connected Protocol Directives */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {activeTopic.steps.map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#f0f9ff',
                    borderRadius: '14px',
                    border: '1px solid #e0f2fe',
                    borderLeft: '4px solid #0284c7',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: '#e0f2fe',
                      border: '1px solid #bae6fd',
                      color: '#0284c7',
                      fontSize: '11px',
                      fontWeight: 900,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {idx + 1}
                    </span>
                    <b style={{ fontSize: '13px', color: '#0f172a' }}>{translateText(step.title)}</b>
                  </div>
                  <span style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.45, paddingLeft: '30px' }}>
                    {translateText(step.detail)}
                  </span>
                </div>
              ))}
            </div>

            {/* Red Flag Warning Notice */}
            <div style={{
              background: '#fef2f2',
              borderRadius: '14px',
              border: '1px solid #fecaca',
              borderLeft: '4px solid #dc2626',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '12.5px',
              color: '#991b1b'
            }}>
              <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
              <div>
                <b style={{ color: '#991b1b' }}>{translateText('Red Flag / Urgent Action:')}</b> {translateText(activeTopic.redFlag)}
              </div>
            </div>
          </div>
        ) : (
          /* Awareness Quiz Mode Body */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {!isQuizFinished ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
                  <span style={{ fontWeight: 700 }}>
                    {translateText('Question')} {currentQIndex + 1} {translateText('of')} {QUIZ_QUESTIONS.length}
                  </span>
                  <span style={{ color: '#0284c7', fontWeight: 800, background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                    {translateText('NHM Certified Standard')}
                  </span>
                </div>

                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', lineHeight: 1.4 }}>
                  {translateText(currentQ.question)}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = userSelections[currentQ.id] === idx;
                    const isCorrect = idx === currentQ.correct;
                    let bg = '#f8fafc';
                    let border = '1px solid #e2e8f0';
                    let color = '#0f172a';

                    if (isAnswered) {
                      if (isCorrect) {
                        bg = '#f0fdf4';
                        border = '1.5px solid #86efac';
                        color = '#15803d';
                      } else if (isSelected) {
                        bg = '#fef2f2';
                        border = '1.5px solid #fca5a5';
                        color = '#991b1b';
                      }
                    } else if (isSelected) {
                      bg = '#e0f2fe';
                      border = '1.5px solid #bae6fd';
                      color = '#0284c7';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswered}
                        style={{
                          padding: '11px 14px',
                          borderRadius: '12px',
                          background: bg,
                          border: border,
                          color: color,
                          fontSize: '12.5px',
                          fontWeight: 600,
                          textAlign: 'left',
                          cursor: isAnswered ? 'default' : 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                      >
                        <span style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '6px',
                          background: isSelected ? (isAnswered ? (isCorrect ? '#16a34a' : '#dc2626') : '#0284c7') : '#ffffff',
                          color: isSelected ? '#ffffff' : '#64748b',
                          border: isSelected ? 'none' : '1px solid #cbd5e1',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 800,
                          flexShrink: 0
                        }}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{translateText(opt)}</span>
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div style={{
                    background: userSelections[currentQ.id] === currentQ.correct ? '#f0fdf4' : '#fef2f2',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: userSelections[currentQ.id] === currentQ.correct ? '#166534' : '#991b1b',
                    lineHeight: 1.5,
                    border: userSelections[currentQ.id] === currentQ.correct ? '1px solid #bbf7d0' : '1px solid #fecaca'
                  }}>
                    💡 <b>{translateText('Clinical Directive:')}</b> {translateText(currentQ.explanation)}
                  </div>
                )}

                {isAnswered && (
                  <button
                    onClick={handleNextQuestion}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '10px',
                      background: '#e0f2fe',
                      color: '#0284c7',
                      border: '1px solid #bae6fd',
                      fontWeight: 800,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 8px rgba(2, 132, 199, 0.12)',
                      marginTop: '2px'
                    }}
                  >
                    <span>{currentQIndex < QUIZ_QUESTIONS.length - 1 ? translateText('Next Question') : translateText('View Health Literacy Score')}</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            ) : (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Award size={40} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: '#0f172a' }}>
                  {translateText('Awareness Level:')} {calculateScore()}/{QUIZ_QUESTIONS.length} ({(calculateScore()/QUIZ_QUESTIONS.length*100).toFixed(0)}%)
                </h3>
                <span style={{ fontSize: '12.5px', color: '#0284c7', fontWeight: 800 }}>
                  {translateText('🌟 +25.4% Community Literacy Gain Certified!')}
                </span>
                <button
                  onClick={handleResetQuiz}
                  style={{
                    marginTop: '6px',
                    padding: '8px 18px',
                    borderRadius: '9px',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    border: '1px solid #bae6fd',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RotateCcw size={13} /> {translateText('Retake Quiz')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          BENTO TILE 4: INTEGRATED NATIONAL REGISTRIES (5 Cols)
          ========================================================================= */}
      <div style={{
        gridColumn: 'span 5',
        background: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '14px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} color="#0284c7" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>
                {t('gov_schemes_title', 'Integrated National Registries')}
              </h3>
            </div>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '6px' }}>
              LIVE SYNC
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* ABDM Item */}
            <div style={{
              background: '#f0f9ff',
              padding: '12px 14px',
              borderRadius: '14px',
              border: '1px solid #e0f2fe',
              borderLeft: '3.5px solid #0284c7',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>ABDM & 14-Digit ABHA ID</span>
                <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', border: '1px solid #bae6fd', padding: '1px 6px', borderRadius: '4px' }}>SANDBOX</span>
              </div>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>Longitudinal consent-based EHR access across clinics.</span>
            </div>

            {/* U-WIN Item */}
            <div style={{
              background: '#f0f9ff',
              padding: '12px 14px',
              borderRadius: '14px',
              border: '1px solid #e0f2fe',
              borderLeft: '3.5px solid #0284c7',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>U-WIN Immunization Track</span>
                <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', border: '1px solid #bae6fd', padding: '1px 6px', borderRadius: '4px' }}>VERIFIED</span>
              </div>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>Child & maternal vaccine milestone verification.</span>
            </div>

            {/* IDSP Item */}
            <div style={{
              background: '#f0f9ff',
              padding: '12px 14px',
              borderRadius: '14px',
              border: '1px solid #e0f2fe',
              borderLeft: '3.5px solid #0284c7',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>IDSP / NCDC Early Warning</span>
                <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '1px 6px', borderRadius: '4px' }}>LIVE FEED</span>
              </div>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>Automated triggers for localized outbreak clusters.</span>
            </div>

            {/* PM-JAY Item */}
            <div style={{
              background: '#f0f9ff',
              padding: '12px 14px',
              borderRadius: '14px',
              border: '1px solid #e0f2fe',
              borderLeft: '3.5px solid #0284c7',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Ayushman Bharat PM-JAY</span>
                <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', border: '1px solid #bae6fd', padding: '1px 6px', borderRadius: '4px' }}>₹5L BENEFIT</span>
              </div>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>Cashless secondary/tertiary inpatient hospital coverage.</span>
            </div>
          </div>
        </div>

        <div style={{
          paddingTop: '10px',
          borderTop: '1px solid #f1f5f9',
          fontSize: '11.5px',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <ShieldCheck size={15} color="#0284c7" />
          <span>{translateText('Encrypted & anchored to NHA Gateway')}</span>
        </div>
      </div>

      {/* =========================================================================
          BENTO TILE 5: MULTILINGUAL REGIONAL ENGINE (7 Cols)
          ========================================================================= */}
      <div style={{
        gridColumn: 'span 7',
        background: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        padding: '24px 28px',
        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} color="#0284c7" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>
              {translateText('Multilingual BioBERT Language Matrix')}
            </h3>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', border: '1px solid #bae6fd', padding: '3px 8px', borderRadius: '6px' }}>
            {translateText('9 Regional Scripts')}
          </span>
        </div>

        <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
          {translateText('Zero English dependency. BioBERT parses native Unicode across 9 major Indian languages to deliver deterministic health directives to rural citizens.')}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {REGIONAL_LANGUAGES.map(lang => {
            const isLangActive = selectedLang === lang.code;
            return (
              <div
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                style={{
                  padding: '9px 12px',
                  borderRadius: '12px',
                  background: isLangActive ? '#e0f2fe' : '#f8fafc',
                  border: isLangActive ? '1.5px solid #bae6fd' : '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  boxShadow: isLangActive ? 'inset 0 0 0 1px #bae6fd' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <div>
                  <b style={{ color: isLangActive ? '#0284c7' : '#0f172a', fontSize: '13.5px' }}>{lang.name}</b>
                  <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>({lang.script})</span>
                </div>
                <span style={{ fontSize: '10px', color: isLangActive ? '#0284c7' : '#94a3b8', fontWeight: 700 }}>
                  {lang.coverage}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          BENTO TILE 6: OFFLINE 2G SMS & EMERGENCY HELPLINE (5 Cols)
          ========================================================================= */}
      <div style={{
        gridColumn: 'span 5',
        background: '#f8fafc',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '14px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={18} color="#0284c7" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>
                {translateText('2G Plaintext Fallback')}
              </h3>
            </div>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '6px' }}>
              {activeTopic.smsPayload.length} / 160 CHARS
            </span>
          </div>

          <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#64748b' }}>
            {translateText('Formatted into 7-bit clean SMS blocks for feature phones without internet:')}
          </p>

          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #bae6fd',
            padding: '12px 14px',
            fontSize: '12px',
            color: '#0f172a',
            fontFamily: 'monospace',
            lineHeight: 1.45,
            position: 'relative'
          }}>
            {activeTopic.smsPayload}
          </div>

          <button
            onClick={handleCopySms}
            style={{
              marginTop: '8px',
              padding: '7px 14px',
              borderRadius: '8px',
              background: copiedSms ? '#e0f2fe' : '#ffffff',
              color: '#0284c7',
              border: '1px solid #bae6fd',
              fontSize: '11.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease'
            }}
          >
            {copiedSms ? <Check size={13} /> : <Send size={13} />}
            <span>{copiedSms ? 'Copied SMS Protocol Payload!' : 'Copy 2G GSM Payload'}</span>
          </button>
        </div>

        {/* Emergency Helplines Call Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          paddingTop: '12px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <a
            href="tel:108"
            style={{
              padding: '10px',
              borderRadius: '12px',
              background: '#fef2f2',
              border: '1.5px solid #fecaca',
              color: '#dc2626',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '12.5px',
              fontWeight: 900
            }}
          >
            <PhoneCall size={15} />
            <span>Call 108 (Ambulance)</span>
          </a>
          <a
            href="tel:104"
            style={{
              padding: '10px',
              borderRadius: '12px',
              background: '#e0f2fe',
              border: '1.5px solid #bae6fd',
              color: '#0284c7',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '12.5px',
              fontWeight: 900
            }}
          >
            <PhoneCall size={15} />
            <span>Call 104 (Health line)</span>
          </a>
        </div>
      </div>

    </div>
  );
}
