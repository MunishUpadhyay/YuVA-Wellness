<div align="center">
  <h1>🌿 YuVA Wellness</h1>
  <p><b>A culturally-aware mental health and wellness platform designed specifically for youth.</b></p>
  <p>
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-folder-structure">Folder Structure</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-deployment">Deployment</a>
  </p>
</div>

---

## 🌟 Overview

**YuVA Wellness** is a full-stack mental health application designed to provide a safe, empathetic, and culturally relevant space for youth. It offers tools for self-reflection, emotion tracking, and AI-driven support, helping users better understand and navigate their mental wellness journey.

## ✨ Features

- **📊 Mood Tracking:** Log your daily emotional state with detailed insights and identify long-term patterns.
- **📓 Mindful Journaling:** A secure, private space to express thoughts, practice gratitude, and reflect.
- **🤖 AI Companion (Gemini-Powered):** An empathetic, culturally-aware conversational agent designed to provide support, guidance, and critical crisis detection.
- **📉 Assessment Check-ins:** Structured mental health reflections that provide deep insights into your current state.
- **🔐 Secure Authentication:** Robust user authentication with OTP-verified login and a full **Forgot Password** recovery flow.
- **🔄 Chat Persistence:** Seamless conversation state that persists across page navigations within the session.
- **✨ Smooth Transitions:** Polished UI experience with synchronized scroll restoration and fluid animations.

---

## 🛠️ Tech Stack

### Frontend
- **React.js** + **Vite** for a blazingly fast development experience.
- **Tailwind CSS** for modern, responsive, and highly customizable styling.
- **Framer Motion** for smooth, synchronized page and component transitions.
- **Deployment:** Vercel

### Backend
- **Python 3** + **FastAPI** for high-performance, asynchronous REST API delivery.
- **SQLAlchemy** (async) + **PostgreSQL** for robust data modeling and persistence.
- **Google GenAI SDK** for advanced, empathetic AI integration (Gemini 2.5 Flash).
- **Deployment:** Render (Free Tier) with a Keep-Alive Cron Setup.

---

## 📂 Folder Structure

The repository is organized independently to allow decoupled scaling and deployments.

```text
GenAI/
├── backend/                       # 🐍 Python FastAPI Backend
│   ├── alembic/                   # Database migration configurations
│   ├── app/                       # Main application codebase
│   │   ├── api/                   # API routes and endpoints (auth, chat, mood, etc.)
│   │   ├── core/                  # Core configurations (security, settings, CORS)
│   │   ├── db/                    # Database session, models, and migrations
│   │   ├── schemas/               # Pydantic schemas for data validation/serialization
│   │   ├── services/              # Business logic (AI processing, email, user management)
│   │   ├── main.py                # FastAPI entry point & application factory
│   │   └── middleware.py          # Custom logging and error-handling middleware
│   ├── requirements.txt           # Python dependencies
│   ├── alembic.ini                # Alembic configuration
│   └── Procfile                   # Deployment configuration for Render
│
└── frontend-react/                # ⚛️ React.js Frontend
    ├── src/                       # Main React source code
    │   ├── app/                   # App-wide providers (Auth, Chat), Routing
    │   ├── components/            # Reusable UI components (Layouts, UI, Transitions)
    │   ├── features/              # Feature-focused modules
    │   │   ├── auth/              # Auth context, protected routes, login/forgot forms
    │   │   └── chat/              # Chat component, Context API persistence logic
    │   ├── pages/                 # Top-level page components (views)
    │   ├── services/              # API Client and service integrations
    │   ├── styles/                # Global and specific CSS modules
    │    index.css                 # Main Tailwind CSS entrypoint
    ├── package.json               # Node.js dependencies and scripts
    ├── vite.config.js             # Vite bundler configuration
    └── tailwind.config.js         # Tailwind CSS styling configuration
```

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd GenAI
```

### 2. Backend Setup
Navigate to the backend directory and set up your virtual environment:
```bash
cd backend
python -m venv venv

# On macOS/Linux:
source venv/bin/activate  
# On Windows:
venv\Scripts\activate

pip install -r requirements.txt
```

**Environment Variables (`backend/.env`):**
Create a `.env` file in the `backend/` directory. You will need:
```env
# Database Configuration
DATABASE_URL=postgresql+asyncpg://user:password@localhost/dbname

# Security Configuration
SECRET_KEY=your_super_secret_key_here

# AI Configuration
GEMINI_API_KEY=your_google_gemini_api_key
```

**Run the Backend:**
```bash
uvicorn app.main:app --reload
```
*API runs locally at `http://localhost:8000`*

### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd ../frontend-react
npm install
```

**Environment Variables (`frontend-react/.env`):**
Create a `.env` file in the `frontend-react/` directory:
```env
VITE_API_URL=http://localhost:8000
```

**Run the Frontend:**
```bash
npm run dev
```
*App runs locally at `http://localhost:5173`*

---

## 🌐 Deployment

The project is structured to be deployed independently. 

### Frontend (Vercel)
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Configuration:** Ensure `VITE_API_URL` is set to the production backend URL in your Vercel Environment Variables.

### Backend (Render Web Service)
- **Environment:** Dedicated Python Web Service
- **Build Command:** `pip install -r requirements.txt`
- **Start Command (via Procfile):** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables:** Set up `DATABASE_URL`, `SECRET_KEY`, and `GEMINI_API_KEY` directly in the Render dashboard.

### ⏱️ Keep-Alive Cron Job
Because the Render Free Tier spins down inactive instances after 15 minutes, the backend features a zero-dependency, ultra-fast `GET /health` endpoint.
- Configure an external cron service (like [cron-job.org](https://cron-job.org/)) to hit `https://your-backend-url.onrender.com/health` every 10-14 minutes to ensure backend availability is maintained seamlessly without causing database strain.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page or submit a Pull Request.

## 📝 License
This project is licensed under the MIT License.
