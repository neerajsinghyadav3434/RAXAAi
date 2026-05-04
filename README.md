# ?? RAXA AI — Early Disease Detection

![Frontend](https://img.shields.io/badge/Frontend-Next.js%2016-black)
![Backend](https://img.shields.io/badge/Backend-Express.js-green)
![Language](https://img.shields.io/badge/Language-TypeScript-blue)
![Status](https://img.shields.io/badge/Status-Active-success)

> AI-powered adaptive screening tool for early detection of 25+ chronic and infectious diseases.

---

## ? Features

- **Smart Adaptive Screening** — multi-step questionnaire (Basics ? Symptoms ? Detection ? Clinical ? Report)
- **Disease Prediction Engine** — scores 25+ diseases using symptom + clinical data with confidence %
- **Health Tips** — per-disease tips fetched from backend after analysis
- **Explain Prediction** — collapsible "Why this result?" section per disease card
- **Health Report Page** — downloadable report with screening history panel (save / restore / delete)
- **Navbar** — mobile hamburger menu with slide-down animation
- **AI Chat** — Ask AI assistant (requires Ollama or Gemini API key)

---

## ?? Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 + React 19 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |
| Backend | Node.js + Express.js |
| State | localStorage (persistent adaptive flow) |
| AI Chat | Ollama (local) / Google Gemini |

---

## ?? Quick Start

### 1. Clone

```bash
git clone https://github.com/neerajsinghyadav3434/RAXAAi.git
cd RAXAAi
```

### 2. Backend

```bash
cd backend
npm install
node server.js
# Running at http://localhost:8000
```

### 3. Frontend (new terminal)

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
# Running at http://localhost:3000
```

---

## ?? Project Structure

```
RAXAAi/
+-- backend/
¦   +-- data/
¦   ¦   +-- diseaseDataset.js       # 25+ disease definitions
¦   +-- routes/
¦   ¦   +-- adaptive.js             # Adaptive screening + analyze endpoint
¦   ¦   +-- diseases.js             # Disease info + health tips endpoint
¦   ¦   +-- predict.js              # Multi-disease prediction
¦   +-- services/
¦   ¦   +-- predictionEngine.js     # Core scoring engine
¦   +-- server.js                   # Express server (port 8000)
¦
+-- frontend/
    +-- app/
        +-- components/
        ¦   +-- AdaptiveQuestionnaire.tsx   # Main screening flow
        ¦   +-- Navbar.tsx                  # Responsive navbar
        ¦   +-- ...
        +-- health-report/
        ¦   +-- page.tsx                    # Report page + history panel
        +-- utils/
        ¦   +-- reportStorage.ts            # Save / load health reports
        ¦   +-- healthHistory.ts            # Multi-report history (localStorage)
        +-- page.tsx                        # Landing page
```

---

## ?? Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/adaptive/questions` | Fetch symptom questions |
| POST | `/api/v2/adaptive/analyze` | Run prediction from answers |
| GET | `/api/v2/diseases/health-tips/:disease` | Get tips for a disease |
| GET | `/api/v2/diseases/fields/:disease` | Get clinical fields for a disease |
| POST | `/api/v2/predict` | Multi-disease detection |

---

## ?? Environment Variables

Create `backend/.env` (optional — works without it in limited mode):

```env
PORT=8000
CORS_ORIGIN=http://localhost:3000
MONGODB_URI=your_mongodb_uri
GOOGLE_GEMINI_API_KEY=your_key
```

Create `frontend/.env.local` (optional):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## ?? Medical Disclaimer

RAXA is a screening aid only — **not** a medical diagnosis tool. Always consult a qualified healthcare professional.

---

## ?? Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "feat: your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

Built with ?? by the RAXA Team
