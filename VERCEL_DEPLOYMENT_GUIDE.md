# 🚀 CyberShield AI — Vercel Deployment Guide

This repository is **100% optimized and ready for zero-config Vercel deployment**.

---

## ⚡ Quick Start: Deploy in 2 Minutes

### Option 1: Deploy via GitHub (Recommended)

1. **Push your code to GitHub / GitLab / Bitbucket**:
   ```bash
   git init
   git add .
   git commit -m "feat: CyberShield AI ready for Vercel deployment"
   git remote add origin https://github.com/YOUR_USERNAME/cybershield.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your **`cybershield`** repository.
   - Vercel will automatically detect the Next.js framework and root `vercel.json`.
   - Click **Deploy**!

---

### Option 2: Deploy from Terminal (Vercel CLI)

Run directly from the root of this project:

```bash
# If using Windows CMD or Git Bash
npx vercel
```

Or run in production mode:
```bash
npx vercel --prod
```

When prompted:
- **Set up and deploy?** -> `y`
- **Which scope?** -> (Select your personal account or team)
- **Link to existing project?** -> `n`
- **Project name?** -> `cybershield-ai` (or press Enter)
- **Directory?** -> `./` (press Enter)

That's it! Vercel will build and assign you a live HTTPS URL (e.g. `https://cybershield-ai.vercel.app`).

---

## 🏗️ Architecture on Vercel

CyberShield supports **two flexible deployment modes** on Vercel:

### 1. 🌟 Standalone Mode (Zero-Config Default)
If no external backend URL is provided, CyberShield runs **completely self-contained on Vercel Serverless**:
- **Authentication**: Supports demo analyst login (`demo@cybershield.ai`) and custom registration sessions.
- **Threat Detection Engine**: Real-time heuristic scanning of URLs (typosquatting, punycode, brand impersonation, high-risk TLDs), Text messages (urgency scoring, credential harvesting, wire fraud lures), and Media/Audio files.
- **AI Security Specialist**: Interactive conversational assistant with contextual cybersecurity guidance.
- **Academy & Quizzes**: Complete interactive courses with instant quiz grading and certificate progress tracking.
- **Dashboards & Reports**: Risk breakdown charts, downloadable forensics reports, and active security alerts.

### 2. ⚡ Full-Stack Mode (Connected to External Python Backend)
If you deploy the Python FastAPI backend (e.g., on Render, Railway, Fly.io, or AWS EC2), you only need to set one environment variable in your Vercel Project Settings:

| Environment Variable | Example Value | Description |
|----------------------|---------------|-------------|
| `BACKEND_URL` | `https://cybershield-backend.onrender.com` | Base URL of your deployed FastAPI server |
| `NEXT_PUBLIC_API_URL` | `https://cybershield-backend.onrender.com/api/v1` | Public client API base URL |

Next.js will automatically proxy all API requests (`/api/v1/*`) to your live Python FastAPI server with machine learning models and SQLite/PostgreSQL database!

---

## 🔑 Demo Login Credentials

You can use the pre-seeded security analyst credentials:
- **Email:** `demo@cybershield.ai`
- **Password:** `CyberShield2026!`
*(Or register any custom account directly on the register page)*

---

## 🩺 Health Check & Verification

Once deployed, you can verify your service health at:
- **`https://<your-vercel-domain>/api/health`**
- **`https://<your-vercel-domain>/dashboard`**
- **`https://<your-vercel-domain>/analyze`**
- **`https://<your-vercel-domain>/learn`**
