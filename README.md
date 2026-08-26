# 🛡️ Spam Shield - AI-Powered Threat Detection System

Spam Shield is a full-stack web application designed for real-time detection and analysis of spam, phishing, and threat messages across SMS and Email channels using Machine Learning (Multinomial Naive Bayes + TF-IDF) and a modern Next.js dashboard.

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Netlify (Frontend + Backend)

This repository is pre-configured with `netlify.toml` for zero-configuration full-stack deployment on Netlify.

### Option A: Deploy via GitHub (Recommended)
1. Push your code to GitHub.
2. Log in to [Netlify](https://app.netlify.com/) and click **"Add new site" > "Import an existing project"**.
3. Select your repository.
4. Netlify will automatically detect `netlify.toml` with the following settings:
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Publish directory**: `frontend/.next`
   - **Functions directory**: `netlify/functions`
5. *(Optional)* Add Environment Variables under **Site Configuration > Environment Variables**:
   - `DATABASE_URL` *(Optional)*: If you want persistent cloud storage (e.g. Supabase, Neon PostgreSQL), add your connection string. Otherwise, SQLite is used automatically.
   - `NEXT_PUBLIC_API_URL` *(Optional)*: Leave empty to use unified Netlify serverless routing.
6. Click **Deploy Site**.

### Option B: Deploy via Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and deploy
netlify login
netlify deploy --prod
```

---

## 📁 Architecture Overview
- **`frontend/`**: Next.js 16 App Router interface styled with Tailwind CSS, Recharts analytics, and interactive 3D particle background.
- **`backend/`**: FastAPI REST API with SQLAlchemy ORM and scikit-learn Naive Bayes spam detector.
- **`netlify/functions/`**: Serverless Python handler using `Mangum` to run FastAPI on Netlify Functions.
- **`netlify.toml`**: Full-stack build, plugin, and routing configuration.
