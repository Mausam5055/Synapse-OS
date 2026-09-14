# 🚀 SynapseOS — Setup & Execution Guide

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python)](https://python.org)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16.3.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)

This guide provides a step-by-step walkthrough to install dependencies and run both the **FastAPI Multi-Agent Backend** and the **Next.js Frontend** for SynapseOS.

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:

| Software | Minimum Version | Check Command |
| :--- | :--- | :--- |
| **Python** | `3.10` or higher | `python --version` |
| **Node.js**| `18.x` or higher | `node -v` |
| **Git** | `Latest` | `git --version` |

---

## 🐍 Part 1: Starting the FastAPI Backend Server

### Step 1: Open Terminal in Project Root
Navigate to the root directory `SynapseOS`:
```powershell
cd e:\SynapseOS
```

### Step 2: Install Python Dependencies
Install all required packages from `backend/requirements.txt`:
```powershell
python -m pip install -r backend/requirements.txt
```
*(Optional standalone install if needed)*:
```powershell
python -m pip install fastapi uvicorn python-dotenv pydantic httpx qrcode pillow reportlab
```

### Step 3: Run the FastAPI Server with Uvicorn
Start the server using `uvicorn` with auto-reloading enabled:
```powershell
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Step 4: Verify Backend is Online
Once started, you will see:
```text
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started server process [...]
INFO:     Application startup complete.
```

- **Health Check URL**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Interactive Swagger API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 🌐 Part 2: Starting the Next.js Frontend

### Step 1: Open a Second Terminal
Navigate to the `frontend` directory:
```powershell
cd e:\SynapseOS\frontend
```

### Step 2: Install Frontend Dependencies
```powershell
npm install
```

### Step 3: Start the Development Server
```powershell
npm run dev
```

### Step 4: Access the Application
Open your browser and navigate to:

| Interface | URL |
| :--- | :--- |
| **Main Portal & Assistant** | [http://localhost:3000](http://localhost:3000) |
| **3D Interactive Body Explorer**| [http://localhost:3000/vibrant](http://localhost:3000/vibrant) |
| **ABHA & Health Records** | [http://localhost:3000/records](http://localhost:3000/records) |

---

## 🛠️ Part 3: Troubleshooting & Tips

### 1. `ModuleNotFoundError: No module named 'dotenv'`
If you encounter this error on startup, run:
```powershell
python -m pip install python-dotenv
```

### 2. Port 8000 Already in Use
If port 8000 is occupied by another process on Windows:
```powershell
# Find process on port 8000
netstat -ano | findstr :8000

# Kill process by PID (replace <PID> with the actual process ID)
taskkill /PID <PID> /F
```

### 3. Missing FractureNet YOLO Model (`ultralytics`)
If `ultralytics` is not installed, the server automatically enters mock mode for scan analysis. To enable local YOLO model inference:
```powershell
python -m pip install ultralytics
```

---

## 🤖 Active Sub-Agents & Endpoints Overview

| Agent / Service | Endpoint | Description |
| :--- | :--- | :--- |
| **Health Check** | `GET /` | Returns platform status & active agents |
| **Swarm Orchestrator** | `POST /api/orchestrate` | Multi-agent coordination pipeline |
| **Symptom Triage** | `POST /api/triage/assess` | Clinical triage & severity scoring |
| **Drug Safety (RxNav)** | `POST /api/pharmacology/check` | Drug interaction & allergy checking |
| **Medical Scan AI** | `POST /api/scans/analyze` | Fracture & radiology scan inference |
| **Digital Health Twin** | `POST /api/digital-twin/simulate`| Physiological organ vitality engine |
| **WhatsApp Webhook** | `POST /api/whatsapp/webhook` | Multi-channel prescription parser |
| **ABDM / ABHA Vault** | `POST /api/abha/verify` | Polygon blockchain cryptographic seal |

---
<div align="center">

### 🌿 Built with love for Fund My Crazy 2026 — A Google Gemini Initiative

</div>
