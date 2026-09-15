'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from '@/context/LanguageContext';
import { Globe, ChevronDown, Check, Search } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'header' | 'nav' | 'compact' | 'drawer';
}

export default function LanguageSelector({ variant = 'header' }: LanguageSelectorProps) {
  const { language, setLanguage, currentLangInfo } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = SUPPORTED_LANGUAGES.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
    l.region.toLowerCase().includes(search.toLowerCase()) ||
    l.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block', textAlign: 'left' }} ref={dropdownRef}>
      {/* Sleek, Compact Minimalist Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '9999px',
          background: '#ffffff',
          color: '#1e293b',
          border: '1px solid #cbd5e1',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          fontSize: '11.5px',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          outline: 'none',
          whiteSpace: 'nowrap'
        }}
        aria-label="Select Language"
        title="Switch Language / भाषा बदलें"
      >
        <Globe size={13} color="#0284c7" style={{ flexShrink: 0 }} />
        <span style={{ fontWeight: 800, color: '#0f172a' }}>{currentLangInfo.nativeName}</span>
        <span style={{ fontSize: '9.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>({currentLangInfo.code})</span>
        <ChevronDown 
          size={11} 
          color="#64748b" 
          style={{ 
            transition: 'transform 0.2s ease', 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' 
          }} 
        />
      </button>

      {/* Sleek Bulletproof Inline-Styled Floating Dropdown Menu */}
      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: '230px',
            maxHeight: '320px',
            overflowY: 'auto',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #bae6fd',
            boxShadow: '0 12px 36px rgba(2,132,199,0.18), 0 4px 12px rgba(0,0,0,0.06)',
            zIndex: 99999,
            padding: '8px',
            boxSizing: 'border-box'
          }}
        >
          {/* Micro Search Input */}
          <div style={{ position: 'relative', marginBottom: '6px', padding: '0 2px' }}>
            <Search 
              size={12} 
              color="#94a3b8" 
              style={{ position: 'absolute', left: '10px', top: '9px', pointerEvents: 'none' }} 
            />
            <input
              type="text"
              placeholder="Search language / भाषा..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px 6px 26px',
                fontSize: '11px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                outline: 'none',
                color: '#1e293b',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {filtered.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(lang.code);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 10px',
                    borderRadius: '10px',
                    fontSize: '11.5px',
                    border: isSelected ? '1px solid #bae6fd' : '1px solid transparent',
                    background: isSelected ? '#f0f9ff' : 'transparent',
                    color: isSelected ? '#0369a1' : '#334155',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.1s ease',
                    boxSizing: 'border-box'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <span style={{ fontSize: '13px' }}>{lang.flag}</span>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', lineHeight: '1.2' }}>{lang.nativeName}</div>
                      <div style={{ fontSize: '9.5px', color: '#64748b', lineHeight: '1.2' }}>{lang.name} • {lang.region}</div>
                    </div>
                  </div>
                  {isSelected && <Check size={13} color="#db2777" style={{ flexShrink: 0 }} />}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ padding: '8px', textAlign: 'center', fontSize: '11px', color: '#94a3b8' }}>
                No matching language
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
