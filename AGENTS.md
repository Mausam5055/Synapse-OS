# Synapse-OS / Sanjeevni — Agent Guidelines & Push Rules

## 1. Dual-Repository Push Protocol
When pushing updates:
`, `requirements.txt`, `Dockerfile`, `Procfile`, etc.).
   - **Branch:** `main`

2. **Main Project Monorepo:**
   - **Target:** `https://github.com/Mausam5055/Synapse-OS.git` (`origin`)
   - **Contents:** Complete monorepo (frontend, backend, docs, blockchain).
   - **Branch:** `main`

## 2. WhatsApp Clinical Messaging Protocol
- **Format:** Emits clean, normal plain text (no markdown syntax such as `*`, `**`, `_`, `#`, `---`, or backticks).
- **Structure:**
  - Status Badge with emoji (e.g., `🔴 SANJEEVNI EMERGENCY TRIAGE — CRITICAL`)
  - Divider `━━━━━━━━━━━━━━━━━━━━`
  - `🩺 Suspected Diagnosis:` Clean clinical impression without leaking internal agent/markdown headings.
  - `📊 Council Consensus:` Percentage agreement.
  - `📋 Immediate Actions:` Top 1-2 prioritized steps.
  - `💊 Medications & Relief (India):`
    - In emergencies (e.g. CNS / trauma / acute abdomen): State safety protocol to withhold self-medication until doctor exam.
    - In home care / mild illness: Include Indian brands/generics (Dolo 650, Electral ORS, Pan-40, Cetirizine) with explicit administration timing (e.g., after food, before breakfast on empty stomach).
  - `🚨 Seek Emergency Care / Call 108 If:` Red flag symptoms.
  - `👉 Quick Shortcuts:` (Reply 5, Reply sos, Reply full).
  - `🌿 Powered by Sanjeevni-OS Multi-Agent Swarm`
