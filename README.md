# 🌿 EcoGreen AI Agent — EcoPick

<div align="center">

![EcoPick Banner](https://img.shields.io/badge/EcoPick-AI%20Sustainability%20Agent-16a34a?style=for-the-badge&logo=leaf&logoColor=white)
![Gemini](https://img.shields.io/badge/Powered%20by-Gemini%202.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**An AI-powered sustainability shopping assistant that helps you make greener product choices.**

[Live Demo](#) • [Features](#-features) • [Setup](#-setup--installation) • [API](#-api-reference) • [Contributing](#-contributing)

</div>

---

## 📌 Overview

**EcoPick** is a full-stack AI agent that analyzes any product's environmental impact and recommends eco-friendlier alternatives. It uses **Google Gemini 2.5 Flash** as its AI engine to:

- Estimate a product's carbon footprint (LOW / MEDIUM / HIGH)
- Calculate a sustainability score (0–100)
- Suggest 2–4 greener alternatives ranked by eco-priority
- Show a side-by-side comparison table
- Answer general sustainability and eco-shopping questions in a ChatGPT-style chat interface

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 💬 **Chat Interface** | ChatGPT-style UI — ask questions or describe products, results appear inline |
| 🔍 **Product Analysis** | 5-step AI workflow: Identify → Estimate → Score → Classify → Recommend |
| 🌱 **Sustainability Score** | Circular gauge showing 0–100 score with bands (Very Poor → Excellent) |
| 🏷️ **Carbon Footprint Badge** | Color-coded LOW / MEDIUM / HIGH pill on every product |
| 🃏 **Alternative Cards** | 2–4 eco-friendlier alternatives with full specs and pricing |
| 📊 **Comparison Table** | Side-by-side table with Best Choice highlighted in green |
| 🏆 **Best Choice Banner** | Clear explanation of the top recommended sustainable product |
| 💡 **Green Tips** | AI-augmented + static eco shopping guidelines |
| 🔗 **Verify on Site** | Every price has a "Verify on site" button linking to the seller |
| ⚠️ **Honesty Rules** | Never fabricates prices/ratings — shows disclaimer when live data unavailable |
| 📱 **Mobile Responsive** | Cards stack vertically, table scrolls horizontally on small screens |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + TypeScript + Tailwind CSS |
| **Backend** | Node.js + Express + TypeScript |
| **AI Engine** | Google Gemini 2.5 Flash via `@google/generative-ai` |
| **Icons** | Lucide React |
| **Web Search** | Tavily API (optional) + smart mock fallback |
| **Dev Tools** | ts-node-dev, ESLint, Prettier |

---

## 📁 Project Structure

```
ecopick/
├── backend/
│   ├── src/
│   │   ├── index.ts                  # Express server entry (port 5000)
│   │   ├── routes/
│   │   │   ├── analyze.ts            # POST /api/analyze — product analysis
│   │   │   └── chat.ts               # POST /api/chat — eco Q&A
│   │   ├── services/
│   │   │   ├── geminiAgent.ts        # Gemini API integration
│   │   │   └── responseParser.ts     # Robust JSON extraction & validation
│   │   ├── prompts/
│   │   │   └── ecoSystemPrompt.ts    # Full AI system prompt + JSON contract
│   │   └── types/
│   │       └── product.ts            # Shared TypeScript interfaces
│   ├── .env                          # Your API keys (gitignored)
│   ├── .env.example                  # Template — copy to .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx                   # Main chat UI with conversation history
│   │   ├── components/
│   │   │   ├── ProductInputForm.tsx
│   │   │   ├── ProductAnalysisCard.tsx
│   │   │   ├── AlternativesGrid.tsx
│   │   │   ├── ComparisonTable.tsx
│   │   │   ├── BestChoiceBanner.tsx
│   │   │   ├── GreenTipsList.tsx
│   │   │   ├── CarbonFootprintBadge.tsx
│   │   │   ├── SustainabilityScoreGauge.tsx
│   │   │   └── LoadingState.tsx
│   │   ├── api/client.ts             # Fetch wrapper for backend
│   │   └── types/product.ts          # Mirror of backend types
│   └── package.json
├── .vscode/
│   ├── tasks.json                    # VS Code: run both servers with Ctrl+Shift+B
│   └── launch.json                   # VS Code: open browser at localhost:5173
├── start.bat                         # One-click Windows launcher
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- A **Google Gemini API key** (free) from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 1. Clone the repository

```bash
git clone https://github.com/Praveen-ece/EcoGreen-AI-Agent.git
cd EcoGreen-AI-Agent/ecopick
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure environment

```bash
# In ecopick/backend/
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
GEMINI_API_KEY=AIzaSy_your_key_here
GEMINI_MODEL=gemini-2.5-flash
TAVILY_API_KEY=          # Optional — for live product price search
```

**Get your free Gemini API key:** https://aistudio.google.com/app/apikey

### 4. Run the app

**Option A — One-click (Windows):**
```
Double-click  start.bat
```

**Option B — VS Code:**
Press `Ctrl + Shift + B` → select **"Start EcoPick (Backend + Frontend)"**

**Option C — Manual (two terminals):**

Terminal 1 — Backend:
```bash
cd ecopick/backend
npm run dev
```

Terminal 2 — Frontend:
```bash
cd ecopick/frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔌 API Reference

### `POST /api/analyze`

Analyzes a product's environmental impact.

**Request:**
```json
{
  "productDescription": "plastic water bottle"
}
```

**Response:** Full `ProductAnalysis` JSON — see `backend/src/types/product.ts`

---

### `POST /api/chat`

Answers general sustainability/eco questions.

**Request:**
```json
{
  "question": "What makes a product truly eco-friendly?"
}
```

**Response:**
```json
{
  "answer": "A truly eco-friendly product considers..."
}
```

---

### `GET /health`

```json
{ "status": "ok", "timestamp": "2026-07-04T..." }
```

---

## 🤖 AI Agent Behavior

The AI agent follows an 8-priority ranking system when recommending alternatives:

| Priority | Criterion |
|----------|-----------|
| 1 | Lowest Carbon Emissions |
| 2 | Highest Sustainability Score |
| 3 | Best Durability |
| 4 | Highest Recyclability |
| 5 | Lowest Packaging Waste |
| 6 | Locally Manufactured |
| 7 | Affordable Price |
| 8 | Highest Customer Rating |

### Sustainability Score Bands

| Score | Rating |
|-------|--------|
| 0–20 | 🔴 Very Poor |
| 21–40 | 🟠 Poor |
| 41–60 | 🟡 Average |
| 61–80 | 🟢 Good |
| 81–100 | ✅ Excellent |

---

## 🛡 Safety & Honesty Rules

- The AI **never fabricates** prices, carbon values, availability, ratings, or certifications
- When live data is unavailable, the UI displays: *"Live product data is unavailable. Please verify the latest information on the seller's website."*
- Every price shown has a **"Verify on site"** button linking to the actual seller
- Backend maps all AI errors to friendly messages — raw Gemini errors never reach the frontend
- The JSON response parser uses robust regex extraction to handle Gemini's markdown-wrapped output

---

## 🌍 How It Works

```
User types a product or question
         │
         ▼
Frontend detects: Question? → /api/chat → Gemini Q&A
                  Product?  → /api/analyze
                                    │
                                    ▼
                          Web search (Tavily/mock)
                                    │
                                    ▼
                        Gemini 2.5 Flash generates JSON
                                    │
                                    ▼
                        responseParser validates & sorts
                                    │
                                    ▼
              React renders: Analysis Card + Alternatives Grid
                            + Comparison Table + Best Choice Banner
                            + Green Tips
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT — built for a sustainable tomorrow 🌱

---

<div align="center">

Made with ❤️ by [Praveen](https://github.com/Praveen-ece)

⭐ Star this repo if you found it helpful!

</div>
