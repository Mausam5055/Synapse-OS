'use client';

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, HelpCircle, AlertTriangle, ArrowRight, RotateCcw, Award, Droplets, Heart, ShieldAlert, BookOpen } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface PreventiveTopic {
  id: string;
  title: string;
  icon: string;
  category: string;
  steps: string[];
  redFlag: string;
  scheme: string;
}

const PREVENTIVE_TOPICS: PreventiveTopic[] = [
  {
    id: 'ors',
    title: 'ORS & Child Diarrhea',
    icon: '💧',
    category: 'Emergency Dehydration Care',
    steps: [
      '1. Take 1 Liter of clean boiled and cooled drinking water.',
      '2. Mix 1 full WHO ORS sachet (or 6 tsp sugar + 1/2 tsp salt in 1L water).',
      '3. Give frequent small sips after every loose stool.',
      '4. Give 1 Zinc tablet (20mg) daily for 14 full days to heal gut lining.'
    ],
    redFlag: 'Sunken eyes, extreme lethargy, or unable to drink -> Rush to PHC.',
    scheme: 'Intensified Diarrhea Control (IDCF) / NHM'
  },
  {
    id: 'poshan',
    title: 'Poshan & Maternal Care',
    icon: '🤱',
    category: 'Maternal Nutrition & Anemia',
    steps: [
      '1. Take 1 Iron-Folic Acid (IFA Red) tablet daily from 4th month of pregnancy.',
      '2. Take Calcium tablets twice daily (at different times from IFA).',
      '3. Eat local iron foods: Moringa (drumstick leaves), spinach, jaggery, amla.',
      '4. Practice exclusive breastfeeding for baby\'s first 6 full months.'
    ],
    redFlag: 'Severe dizziness, facial swelling, or blurred vision -> Check BP.',
    scheme: 'Poshan Abhiyaan & Anemia Mukt Bharat'
  },
  {
    id: 'vector',
    title: 'Vector / Dengue Control',
    icon: '🦟',
    category: 'Mosquito & Malaria Prevention',
    steps: [
      '1. Observe "Dry Day" every Sunday: empty coolers, flowerpots & tyres.',
      '2. Keep all water storage drums tightly covered with lids/cloth.',
      '3. Sleep inside Long-Lasting Insecticide-treated Nets (LLINs).',
      '4. Wear full-sleeve clothes (Dengue mosquito bites at dawn/dusk).'
    ],
    redFlag: 'High fever with bleeding gums or severe abdominal pain -> Urgent hospital care.',
    scheme: 'National Vector Borne Disease Control (NVBDCP)'
  },
  {
    id: 'wash',
    title: 'Clean Water & Hygiene',
    icon: '🧼',
    category: 'WASH & Waterborne Disease',
    steps: [
      '1. Boil drinking water for 1-2 minutes or use chlorine tablets (1 per 20L).',
      '2. Wash hands with soap for 20s before eating and after toilet.',
      '3. Store water in narrow-mouth vessels with ladle to avoid hand contact.',
      '4. Bi-annual Albendazole (400mg) chewable tablet on Deworming Day.'
    ],
    redFlag: 'Yellow eyes (Jaundice), high remittent fever (Typhoid), or rice-water stool.',
    scheme: 'Jal Jeevan & Swachh Bharat Mission'
  },
  {
    id: 'ncd',
    title: 'NCD & Heart Health',
    icon: '❤️',
    category: 'Hypertension & Diabetes',
    steps: [
      '1. Keep daily salt intake under 1 teaspoon (<5g/day).',
      '2. Strictly avoid bidi, gutkha, khaini, and smoking.',
      '3. 30 minutes brisk walking or agricultural physical activity daily.',
      '4. Free annual BP & Blood Sugar screening at Ayushman Arogya Mandir.'
    ],
    redFlag: 'Chest pain radiating to left arm or non-healing foot ulcers.',
    scheme: 'National Programme for Prevention of NCDs'
  }
];

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the correct amount of clean water needed to mix 1 standard WHO ORS sachet?',
    options: [
      'Exactly 1 Liter of clean drinking water',
      'Half a cup of warm tea',
      '2 Liters of boiling milk',
      'Only 1 glass (200ml)'
    ],
    correct: 0,
    explanation: 'WHO-standard ORS is calibrated for exactly 1 Liter of clean water to maintain ideal osmolarity.'
  },
  {
    id: 'q2',
    question: 'How long should a mother practice exclusive breastfeeding (no outside water or honey)?',
    options: [
      'First 2 weeks only',
      'First 6 full months (180 days)',
      'Until 1 month old',
      'Only when the child cries'
    ],
    correct: 1,
    explanation: 'Exclusive breastfeeding for 6 full months provides complete nutrition and immune antibodies against infections.'
  },
  {
    id: 'q3',
    question: 'When do Dengue-transmitting Aedes mosquitoes primarily bite people?',
    options: [
      'Daylight hours (early morning & late afternoon)',
      'Only at midnight in deep dark forests',
      'Only during underwater swimming',
      'They never bite humans'
    ],
    correct: 0,
    explanation: 'Aedes aegypti mosquitoes breed in clean domestic water and are aggressive daytime biters.'
  }
];

export default function RuralPreventiveHub() {
  const { t, translateText } = useLanguage();
  const [activeTab, setActiveTab] = useState<'guides' | 'quiz'>('guides');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('ors');

  // Quiz state
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [userSelections, setUserSelections] = useState<{ [qId: string]: number }>({});
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isQuizFinished, setIsQuizFinished] = useState<boolean>(false);

  const activeTopic = PREVENTIVE_TOPICS.find(t => t.id === selectedTopicId) || PREVENTIVE_TOPICS[0];
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

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '20px',
      border: '1px solid #e2e8f0',
      padding: '24px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      fontFamily: '"Times New Roman", Times, serif'
    }}>
      
      {/* Header & Mode Switcher */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '1px solid #f1f5f9',
        paddingBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 100%)',
            border: '1px solid #bae6fd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0284c7'
          }}>
            <BookOpen size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
              {t('rural_preventive_title', 'Rural Health Literacy & Self-Care')}
            </h3>
            <span style={{ fontSize: '11.5px', color: '#64748b' }}>
              {translateText('National Health Mission • Poshan Abhiyaan • WASH Guidelines')}
            </span>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div style={{
          display: 'flex',
          gap: '4px',
          background: '#f8fafc',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <button
            onClick={() => setActiveTab('guides')}
            style={{
              padding: '6px 16px',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'guides' ? '#0284c7' : 'transparent',
              color: activeTab === 'guides' ? '#ffffff' : '#64748b',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: activeTab === 'guides' ? '0 2px 6px rgba(2, 132, 199, 0.25)' : 'none'
            }}
          >
            {t('tab_guides', 'Clinical Guides')}
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            style={{
              padding: '6px 16px',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'quiz' ? '#db2777' : 'transparent',
              color: activeTab === 'quiz' ? '#ffffff' : '#64748b',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: activeTab === 'quiz' ? '0 2px 6px rgba(219, 39, 119, 0.25)' : 'none'
            }}
          >
            {t('tab_quiz', 'Awareness Quiz')}
          </button>
        </div>
      </div>

      {/* Mode 1: Clinical Guides */}
      {activeTab === 'guides' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Topic Pills — Cleanly Wrapped Grid */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {PREVENTIVE_TOPICS.map(topic => {
              const isSelected = selectedTopicId === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopicId(topic.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    background: isSelected ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : '#f8fafc',
                    color: isSelected ? '#ffffff' : '#334155',
                    border: isSelected ? '1px solid #0284c7' : '1px solid #e2e8f0',
                    fontSize: '12px',
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(2, 132, 199, 0.2)' : 'none'
                  }}
                >
                  <span>{topic.icon}</span>
                  <span>{translateText(topic.title)}</span>
                </button>
              );
            })}
          </div>

          {/* Active Guide Card */}
          <div style={{
            background: '#f8fafc',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{activeTopic.icon}</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  {translateText(activeTopic.title)}
                </span>
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '8px',
                background: '#fdf2f8',
                color: '#db2777',
                border: '1px solid #fbcfe8'
              }}>
                {translateText(activeTopic.category)}
              </span>
            </div>

            {/* Structured Step Numbers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeTopic.steps.map((s, i) => (
                <div 
                  key={i} 
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    background: '#ffffff',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #edf2f7',
                    fontSize: '13px',
                    color: '#334155',
                    lineHeight: 1.5
                  }}
                >
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    fontSize: '11px',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '1px'
                  }}>
                    {i + 1}
                  </span>
                  <span>{translateText(s.replace(/^\d+\.\s*/, ''))}</span>
                </div>
              ))}
            </div>

            {/* Red Flag Warning Box */}
            <div style={{
              background: '#fef2f2',
              borderRadius: '12px',
              border: '1px solid #fecaca',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '12.5px',
              color: '#991b1b'
            }}>
              <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
              <div>
                <b>{translateText('Red Flag / Immediate Escalation:')}</b> {translateText(activeTopic.redFlag)}
              </div>
            </div>

            {/* Government Scheme Accreditation Tag */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '6px',
              borderTop: '1px solid #e2e8f0',
              fontSize: '11.5px',
              color: '#64748b'
            }}>
              <span>{translateText('Endorsed Standard:')}</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>
                🏛️ {translateText(activeTopic.scheme)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Interactive Awareness Quiz */}
      {activeTab === 'quiz' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {!isQuizFinished ? (
            <div style={{
              background: '#f8fafc',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700 }}>
                  {translateText('Question')} {currentQIndex + 1} {translateText('of')} {QUIZ_QUESTIONS.length}
                </span>
                <span style={{ color: '#0284c7', fontWeight: 800, background: '#e0f2fe', padding: '3px 8px', borderRadius: '6px' }}>
                  {translateText('NHM Awareness Metric')}
                </span>
              </div>

              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '16px', lineHeight: 1.5 }}>
                {translateText(currentQ.question)}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {currentQ.options.map((opt, idx) => {
                  const isSelected = userSelections[currentQ.id] === idx;
                  const isCorrect = idx === currentQ.correct;
                  let bg = '#ffffff';
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
                    bg = '#eff6ff';
                    border = '1.5px solid #93c5fd';
                    color = '#0284c7';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: bg,
                        border: border,
                        color: color,
                        fontSize: '13px',
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
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: isSelected ? (isAnswered ? (isCorrect ? '#16a34a' : '#dc2626') : '#0284c7') : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#64748b',
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
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '12.5px',
                  color: userSelections[currentQ.id] === currentQ.correct ? '#166534' : '#991b1b',
                  marginBottom: '14px',
                  lineHeight: 1.5,
                  border: userSelections[currentQ.id] === currentQ.correct ? '1px solid #bbf7d0' : '1px solid #fecaca'
                }}>
                  💡 <b>{translateText('Clinical Explanation:')}</b> {translateText(currentQ.explanation)}
                </div>
              )}

              {isAnswered && (
                <button
                  onClick={handleNextQuestion}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
                  }}
                >
                  <span>{currentQIndex < QUIZ_QUESTIONS.length - 1 ? translateText('Next Question') : translateText('View Health Literacy Score')}</span>
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
          ) : (
            <div style={{
              background: '#f8fafc',
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              padding: '28px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: '#ecfdf5',
                border: '1.5px solid #a7f3d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669'
              }}>
                <Award size={28} />
              </div>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                {translateText('Awareness Level:')} {calculateScore()}/{QUIZ_QUESTIONS.length} ({(calculateScore()/QUIZ_QUESTIONS.length*100).toFixed(0)}%)
              </h4>
              <span style={{ fontSize: '13px', color: '#059669', fontWeight: 800 }}>
                {translateText('🌟 +25.4% Health Literacy Gain Achieved!')}
              </span>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0, maxWidth: '420px', lineHeight: 1.5 }}>
                {translateText('Demonstrated high proficiency with National Health Mission preventive child, maternal, and vector-borne infection guidelines.')}
              </p>
              <button
                onClick={handleResetQuiz}
                style={{
                  marginTop: '8px',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.2)'
                }}
              >
                <RotateCcw size={14} /> {translateText('Retake Quiz')}
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
