# ☸️ Kubernetes Orchestration

[![Kubernetes](https://img.shields.io/badge/Kubernetes-Manifests-326CE5?style=flat-square&logo=kubernetes)](https://kubernetes.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docker.com)

Production-grade Kubernetes manifests for deploying the **SynapseOS Multi-Agent Health Platform** with auto-scaling, isolated namespaces, and secure config management.

---

## 🏗 Cluster Architecture

The platform runs across multiple decoupled microservices to ensure high availability and robust performance:

| Component | Manifest | Description |
| :--- | :--- | :--- |
| **Frontend Node** | `frontend-deployment.yaml` | Next.js 16 Web Application. |
| **Backend & Meta WhatsApp** | `backend-deployment.yaml` | FastAPI Service (13 AI Agents & Meta WhatsApp Cloud API). |
| **Ingress Controller** | `ingress.yaml` | NGINX Ingress rules for routing external traffic. |
| **Autoscaler (HPA)** | `hpa.yaml` | CPU/Memory based horizontal pod autoscaling. |
| **Config/Secrets** | `configmap.yaml`, `secrets.yaml`| Centralized environment variable management. |

---

## 🚀 Deployment Guide

### 1. Initialize Namespace

Create the isolated namespace for all SynapseOS resources:
```powershell
kubectl apply -f namespace.yaml
```

### 2. Apply Configuration and Secrets

Load your environment variables and API keys into the cluster:
```powershell
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml
```
*(Ensure you have populated `secrets.yaml` with Base64 encoded values for your LLM APIs before applying).*

### 3. Deploy Microservices

Spin up the frontend and backend deployments:
```powershell
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
```

### 4. Configure Networking & Autoscaling

Enable routing and load balancing:
```powershell
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
```

---

## 📊 Monitoring

Check the status of your pods in the `synapseos-system` namespace:
```powershell
kubectl get pods -n synapseos-system
```

Monitor horizontal autoscaling events:
```powershell
kubectl get hpa -n synapseos-system
```

---
<div align="center">

### 🌿 Built with love for Fund My Crazy 2026 — A Google Gemini Initiative

</div>
