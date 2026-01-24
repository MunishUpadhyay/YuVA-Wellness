# 🧠 YuVA Wellness - AI-Powered Mental Health Companion

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com)
[![SQLite](https://img.shields.io/badge/Database-SQLite-lightblue.svg)](https://sqlite.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Mental Health](https://img.shields.io/badge/Mental%20Health-Support-purple.svg)](#)
[![Privacy First](https://img.shields.io/badge/Privacy-First-green.svg)](#)

> **🌟 Your personal AI companion for mental wellness. Chat, track, analyze, and grow - all while keeping your data completely private.**

[🚀 Try It Now](#-quick-start) • [✨ Features](#-what-youll-discover) • [🛠️ Install](#-installation) • [🆘 Need Help?](#-crisis-support)

</div>

---

## 🌟 What You'll Discover

YuVA Wellness isn't just another mental health app. It's your private, AI-powered companion that understands, learns, and grows with you on your wellness journey.

### 🏠 **Welcome Home**
![Homepage Screenshot](https://raw.githubusercontent.com/MunishUpadhyay/Materials/refs/heads/main/Screenshot%202026-01-22%20222823.png)

Your journey begins here. A clean, welcoming interface that feels like a warm hug. But there's so much more beneath the surface...

---

### 💬 **AI Chat That Actually Gets You**
![AI Chat Interface](https://raw.githubusercontent.com/MunishUpadhyay/Materials/refs/heads/main/Screenshot%202026-01-22%20223250.png)

Ever wished you could talk to someone who truly understands mental health? Our AI doesn't just respond - it listens, remembers, and provides real support when you need it most.

**What makes it special:**
- Real-time streaming conversations
- Crisis detection and immediate help
- Remembers your journey
- Available 24/7, completely private

---

### 🧠 **Your Personal AI Dashboard**
![AI Dashboard](https://raw.githubusercontent.com/MunishUpadhyay/Materials/refs/heads/main/Screenshot%202026-01-24%20045730.png)

Imagine having a personal wellness coach who knows exactly what you need, when you need it. Your dashboard adapts to you, not the other way around.

**Discover:**
- Personalized daily insights
- Interactive mindfulness sessions
- Smart wellness recommendations
- Progress tracking that motivates

---

### 📝 **Smart Journaling Experience**
![Journal Interface](https://raw.githubusercontent.com/MunishUpadhyay/Materials/refs/heads/main/Screenshot%202026-01-23%20003334.png)

Transform your thoughts into insights. Our intelligent journaling system doesn't just store your entries - it understands them, analyzes patterns, and helps you grow.

**Experience:**
- Beautiful, distraction-free writing
- AI-powered sentiment analysis
- Pattern recognition in your thoughts
- Complete privacy - your words stay yours

---

### 😊 **Mood Tracking Reimagined**
![Mood Tracking](https://raw.githubusercontent.com/MunishUpadhyay/Materials/refs/heads/main/Screenshot%202026-01-24%20045624.png)

Forget boring mood logs. Track your emotional journey with our intuitive system that makes mood logging feel natural and insightful.

**Discover:**
- Quick emoji-based mood selection
- Comprehensive mood assessments
- Visual mood calendar
- Trend analysis that surprises you

---

### 📊 **Analytics That Tell Your Story**
![Analytics Dashboard](https://raw.githubusercontent.com/MunishUpadhyay/Materials/refs/heads/main/Screenshot%202026-01-24%20045656.png)

Your mental health journey visualized like never before. Discover trends, celebrate progress, and get insights that actually help you grow.

**Uncover:**
- Mood patterns and triggers
- Wellness streaks and achievements
- Personalized recommendations
- Advanced pattern detection

---

### 🆘 **Crisis Support When It Matters Most**
![Resources Page](https://raw.githubusercontent.com/MunishUpadhyay/Materials/refs/heads/main/Screenshot%202026-01-24%20045756.png)

Sometimes we all need immediate help. Access comprehensive crisis resources, helplines, and support - all formatted for when every second counts.

**Always available:**
- Emergency contacts for India and worldwide
- Mental health helplines
- Self-help strategies
- Professional resources

---

## 🚀 Quick Start

Ready to begin your wellness journey? It's easier than you think.

### 📥 **Get Started in 3 Steps**

```bash
# 1. Clone and enter
git clone https://github.com/yourusername/yuva-wellness.git
cd yuva-wellness

# 2. Install dependencies
pip install -r requirements.txt

# 3. Launch your wellness companion
python run.py
```

**Windows users?** Just double-click `start_server.bat`

### 🌐 **Open Your Wellness Portal**
Visit **http://localhost:8000** and discover what makes YuVA special.

---

## 🚀 Live Demo & Deployment

### 🌍 **Try YuVA Wellness Online**
Experience YuVA Wellness without any installation:

**🔗 Live Demo**: [https://yuva-wellness-demo.herokuapp.com](https://yuva-wellness-demo.herokuapp.com)

*Note: Demo resets every 24 hours. For full experience, run locally.*

### ☁️ **Deploy Your Own Instance**

#### **Deploy to Heroku** (Recommended)
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/yourusername/yuva-wellness)

#### **Deploy to Railway**
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/yuva-wellness)

#### **Deploy to Render**
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/yourusername/yuva-wellness)

#### **Deploy to DigitalOcean**
[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/yourusername/yuva-wellness)

### 🐳 **Docker Deployment**
```bash
# Quick Docker setup
docker build -t yuva-wellness .
docker run -p 8000:8000 yuva-wellness
```

### 🔧 **Environment Variables for Deployment**
```env
# Required for production
PORT=8000
DATABASE_URL=sqlite:///./yuva.db

# Optional enhancements
ENABLE_ANALYTICS=false
SECRET_KEY=your-production-secret-key
CORS_ORIGINS=https://yourdomain.com
```

---

## � Screenshots & Assets

### 🖼️ **Adding Screenshots to Your Fork**

To display screenshots in your README, create the following folder structure in your repository:

```
your-repo/
├── assets/
│   └── screenshots/
│       ├── homepage.png
│       ├── chat-interface.png
│       ├── ai-dashboard.png
│       ├── journal-page.png
│       ├── mood-tracking.png
│       ├── analytics-dashboard.png
│       └── resources-page.png
```

### 📋 **Screenshot Guidelines**
- **Resolution**: 1920x1080 or 1440x900 for desktop views
- **Format**: PNG for crisp UI elements
- **Mobile**: Include mobile screenshots at 375x812 (iPhone X)
- **File Size**: Keep under 500KB each for fast loading
- **Content**: Use sample data, avoid personal information

### 🔗 **Update Image Links**
Replace `yourusername` in the image URLs with your GitHub username:
```markdown
![Homepage Screenshot](https://github.com/YOUR-USERNAME/yuva-wellness/assets/screenshots/homepage.png)
```

---

## 🔒 Privacy Promise

**Your data never leaves your device.** No cloud storage, no tracking, no sharing. Just you and your private AI companion.

- ✅ **100% Local** - Everything runs on your computer
- ✅ **No Accounts** - No registration, no personal info required
- ✅ **No Tracking** - Your privacy is sacred
- ✅ **Open Source** - See exactly how it works

---

## 🛠️ Built With Love

**Modern Tech Stack:**
- 🐍 **Python & FastAPI** - Lightning-fast backend
- 🎨 **Modern CSS & JavaScript** - Beautiful, responsive design
- 🗄️ **SQLite** - Your personal, local database
- 🤖 **Custom AI** - Specialized mental health knowledge
- 📱 **PWA Ready** - Install like a native app

---

## 🆘 Crisis Support

**If you're in crisis, you're not alone:**

### 🇮🇳 **India**
- **Emergency**: 112 | **KIRAN**: 1800-599-0019 | **Sneha**: 044-24640050

### 🌍 **International**
- **US**: 988 | **UK**: 116 123 | **Australia**: 13 11 14

*YuVA Wellness supports your journey but isn't a replacement for professional care.*

---

## 🤝 Join the Journey

Found a bug? Have an idea? Want to contribute to mental health tech?

**We'd love your help:**
- 🐛 [Report Issues](https://github.com/yourusername/yuva-wellness/issues)
- 💡 [Suggest Features](https://github.com/yourusername/yuva-wellness/discussions)
- 🔧 [Contribute Code](https://github.com/yourusername/yuva-wellness/pulls)

---

## 📄 License

MIT License - Use it, modify it, share it. Mental health support should be accessible to everyone.

---

<div align="center">

## 💝 Your Mental Health Matters

**Ready to discover what YuVA Wellness can do for you?**

[🚀 **Start Your Journey**](http://localhost:8000) • [💬 **Chat Now**](http://localhost:8000/chat) • [🧠 **Explore Dashboard**](http://localhost:8000/dashboard)

*Made with ❤️ for your wellbeing*

---

**⭐ Star this repo if YuVA Wellness helps you on your journey!**

</div>