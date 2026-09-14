# 🩺 SynapseOS — Frontend Clinical Dashboard & Multimodal Web App

[![Next.js](https://img.shields.io/badge/Next.js-16.3.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

A Next.js 16 and React 19 clinical workstation powering real-time healthcare orchestration, 3D Digital Health Twin, medical imaging analysis, and multimodal voice interaction.

---

## 🌟 Key Features

- **3D Digital Health Twin**: Interactive Three.js WebGL anatomical model with real-time multi-organ vitality color mapping (Heart, Kidneys, Liver, Pancreas, Lungs).
- **Multi-Agent Orchestration Visualizer**: Real-time visualization of the LangGraph multi-agent DAG execution, trace badges, and agent consensus confidence scores.
- **Medical Vision AI Viewer**: FractureNet YOLOv8 bone fracture bounding boxes, MONAI chest radiography heatmaps, and TrOCR prescription extraction.
- **Multimodal Voice Assistant**: Integrated voice assistant via `@vapi-ai/web` with continuous medical reasoning.
- **ABDM Health Passport**: Verifiable digital health card with cryptographic QR codes and on-chain Polygon ledger integration.
- **WHO Disease Surveillance Map**: Geo-spatial visualization of epidemiological data and clinical protocols across India.

---

## 🚀 Getting Started

### 1. Install Dependencies
```powershell
cd frontend
npm install --legacy-peer-deps
```

### 2. Start the Development Server
```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Technology Stack

| Category | Technologies Used |
| :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) |
| **UI & State** | [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/) |
| **Icons & Animation** | [Lucide React](https://lucide.dev/), [Lenis Smooth Scroll](https://lenis.darkroom.engineering/) |
| **Voice Intelligence** | [@vapi-ai/web](https://vapi.ai/) |
| **Blockchain** | [Ethers.js v6](https://docs.ethers.org/) |
| **Maps & Geo** | [react-simple-maps](https://www.react-simple-maps.io/), [d3-geo](https://d3js.org/d3-geo) |

---

## 📁 Frontend Directory Structure

```text
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages (orchestrator, about, vibrant, etc.)
│   ├── components/
│   │   ├── assistant/          # Multimodal voice & chat assistant components
│   │   ├── home/               # Landing page sections, hero sliders, and stack diagrams
│   │   ├── orchestrator/       # Clinical workstation panels (Twin, Scans, Vitals, Blockchain)
│   │   ├── sections/           # Modular presentation sections
│   │   └── ui/                 # Reusable UI primitives and modals
│   ├── context/                # Global application and theme state
│   ├── data/                   # Navigation items and mock patient profiles
│   ├── lib/                    # Blockchain contracts, API clients, and utilities
│   └── styles/                 # Global styles and design tokens
└── public/                     # Static assets and models
```

---
<div align="center">

### 🌿 Built with love for Fund My Crazy 2026 — A Google Gemini Initiative

</div>
