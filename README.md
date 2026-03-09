# 🌿 YuVA Wellness: Your Empathetic AI Companion

<div align="center">
  <img src="https://img.shields.io/badge/Health-%23FF6B6B?style=for-the-badge&logo=heart&logoColor=white" alt="Health" />
  <img src="https://img.shields.io/badge/AI-Gemini%20Flash-blue?style=for-the-badge&logo=google-gemini&logoColor=white" alt="AI" />
  <img src="https://img.shields.io/badge/Security-Safety%20Net-green?style=for-the-badge&logo=shield&logoColor=white" alt="Security" />
  <img src="https://img.shields.io/badge/Stack-FastAPI%20%26%20React-darkblue?style=for-the-badge&logo=fastapi&logoColor=white" alt="Stack" />
</div>

<br />

> **YuVA Wellness** is a culturally-aware mental health and wellness platform designed specifically for youth. It combines high-precision analytics with empathetic AI to provide a safe space for reflection and support.

---

## 🔗 Live Experience
🚀 **Frontend:** [yuva-wellness.vercel.app](https://yuva-wellness.vercel.app)  
⚙️ **Backend API:** [yuva-wellness-gzhr.onrender.com](https://yuva-backend-gzhr.onrender.com)

---

## 🎯 The Use Case
Modern youth face unique pressures—from academic stress to social dynamics—often without a judgment-free space to process their emotions. **YuVA** (meaning "Youth" in Sanskrit) bridges this gap by providing:
1. **Immediate Support**: AI that understands the emotional nuances of Indian youth.
2. **Data-Driven Self-Awareness**: Visualizing mood patterns to identify triggers before they become overwhelming.
3. **Safety First Architecture**: Built-in crisis detection and secure recovery systems.

---

## 🔥 Key Features

### 🤖 Multi-Model AI Chat
Choose your intelligence level! YuVA now supports real-time switching between four powerful Gemini models:
- **🚀 Gemini 1.5 Flash**: Lightning-fast, reliable support (Default).
- **🧠 Gemini 1.5 Pro**: Deep reasoning for complex emotional reflections.
- **⚡ Gemini 2.0 Lite**: Cutting-edge efficiency and speed.
- **🔥 Gemini 2.0 Flash**: Premium high-performance interactions.

### 📊 Precision Wellness Analytics
- **Real-Time Scoring**: A live wellness percentage based on your entire mood history.
- **Insightful Guidance**: Dynamic feedback that tells you exactly how to improve your scores.
- **Visual Trends**: Beautifully rendered charts showing your emotional journey over time.

### 🛡️ The "Safety Net" Infrastructure
- **Secure Authentication**: Robust system featuring **Google OAuth 2.0** and standard email/password login.
- **Recovery Key System**: Never get locked out. Automatic generation of secure recovery keys during signup.
- **Crisis Detection Layer**: Deterministic keyword mapping that triggers immediate support resources if high distress is detected.

### 🧪 Modern Technical Excellence
- **Fluid UI**: Synchronized page transitions and scroll restoration using Framer Motion.
- **Asynchronous Cloud Architecture**: High-concurrency FastAPI backend with decoupled React frontend.
- **Hardenened Security**: Multi-layered password hashing and secure token management.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy (Async) |
| **AI / LLM** | Google Gemini API (1.5 & 2.0 Versions) |
| **Database** | PostgreSQL |
| **Auth** | Google OAuth 2.0-based Verification |

---

## 📂 Project Architecture

```text
GenAI/
├── backend/                       # 🐍 Python Asynchronous Backend (FastAPI)
│   ├── app/
│   │   ├── api/                   # Analytics, AI Chat, Auth, Moods, Journal
│   │   ├── services/              # LLM Client, Email, Auth Logic, Safety Layers
│   │   ├── db/                    # Models & Migrations (SQLAlchemy)
│   │   └── core/                  # Configuration & Security Settings
│
└── frontend-react/                # ⚛️ React.js Responsive Frontend (Vite)
    ├── src/
    │   ├── features/              # Modular ChatContext, AuthContext, Mood Tracking
    │   ├── components/            # UI System, Page Transitions, Layouts
    │   ├── services/              # API Client (Axios-based)
    │   └── pages/                 # Dashboard, Analytics, Chat, Profile
```

---

## 🤝 Contributing
YuVA is a mission-driven project. Contributions to its empathetic response patterns or analytics precision are always welcome.

## 📝 License
Licensed under the [MIT License](LICENSE). 
*Designed with ❤️ for a healthier youth.*
