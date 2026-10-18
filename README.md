# 🛡️ CyberShield AI — Threat Detection & Digital Safety Platform

[![Vercel Deployment Ready](https://img.shields.io/badge/Vercel-Deployment%20Ready-black?style=flat&logo=vercel)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-blue?logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)

**CyberShield AI** is an intelligent cybersecurity threat inspection, forensics, and digital safety platform designed to protect users against phishing campaigns, deepfakes, synthetic voice clones, and social engineering attacks.

---

## ✨ Features

- **🎯 Threat Analysis Center**:
  - **URL Inspector**: Identifies deceptive subdomains, homograph tricks, punycode spoofing, and high-risk disposable TLDs.
  - **Text & Email Forensics**: Scans messages for urgency manipulation, BEC wire fraud indicators, and credential harvesting kits.
  - **Multimodal Forensics**: Inspects image EXIF/steganography, audio synthetic vocoder artifacts, and video facial boundary anomalies.
- **📊 Security Command Center**:
  - Live security posture metrics, threat severity distributions, active protection shields, and downloadable forensics reports.
- **🤖 CyberShield AI Assistant**:
  - Contextual cybersecurity specialist answering security questions and guiding incident triage.
- **🎓 Interactive Security Academy**:
  - In-depth interactive modules with quizzes and real-time grading to build strong digital defense habits.
- **⚡ Vercel Cloud Native**:
  - Zero-config deployment with built-in serverless fallback and optional external FastAPI connectivity.

---

## 🚀 Quick Deployment to Vercel

For complete deployment instructions, see [VERCEL_DEPLOYMENT_GUIDE.md](file:///c:/Users/hp/OneDrive/Desktop/Cybershield/VERCEL_DEPLOYMENT_GUIDE.md).

```bash
# Deploy to Vercel via CLI
npx vercel
```

Or connect the repository on [vercel.com](https://vercel.com) for automatic CI/CD deployments on git push.

---

## 💻 Local Development

### 1. Run Frontend (Next.js)
```bash
npm run dev
# or cd frontend && npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Run Backend (FastAPI, Optional)
```bash
cd backend
python run.py
```
FastAPI runs on [http://127.0.0.1:8000](http://127.0.0.1:8000) with interactive Swagger documentation at `/docs`.

---

## 🔑 Demo Account

- **Email:** `demo@cybershield.ai`
- **Password:** `CyberShield2026!`
