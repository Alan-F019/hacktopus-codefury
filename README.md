# FinWise — Personal Financial Health & Wealth Intelligence Platform

> **Codefury 9.0 Hackathon | WealthTech Theme | 24-Hour Sprint**  
> A production-grade, interactive financial health dashboard built with React (Vite), Tailwind CSS, Recharts, and Firebase Auth, engineered with a decoupled service-first architecture and fully documented API contract.

---

## 🌟 Overview

**FinWise** empowers individuals to assess, understand, and optimize their personal financial health through intuitive data visualizations, algorithmic risk profiling, and educational wealth planning tools. 

Designed specifically to address the challenge of disjointed personal finance apps, FinWise integrates:
1. **0–100 Financial Health Score:** A weighted composite score evaluating Emergency Buffer (30%), Spending Discipline (25%), Investment Drift (25%), and Goal Progress (20%).
2. **"This Month You Should" Action Plan:** Prioritized, bite-sized recommendations with direct health score impact.
3. **Automated Risk Questionnaire & Asset Benchmarking:** Mapped to 4 risk profiles (Conservative, Moderate, Aggressive, Very Aggressive) with real-time drift indicators.
4. **Interactive Statement Forensics:** Drag-and-drop CSV parser generating dynamic, computed spending observations.
5. **Milestone Trackers & SIP Compounding Calculator:** Real-time simulations projecting compound interest vs linear cash savings.
6. **AI Wealth Coach (LLM Ready):** Structured narrative synthesis and "What-If" scenario simulator.

---

## 🚀 Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS 4 (Custom dark mode via `.dark` class, Deep Navy `#0F172A`, Emerald `#10B981`, Muted Gold `#D4AF37`)
- **Visualizations:** Recharts (Donut Pie Charts, Bi-axial Bar Charts, Spline Trend Curves)
- **Routing:** React Router DOM (Single-page app navigation)
- **Data Parsing:** PapaParse (Client-side RFC-4180 CSV parsing)
- **Authentication:** Firebase Auth SDK with graceful Demo Sandbox fallback
- **State & Storage:** Context API (`AuthContext`, `ThemeContext`) + LocalStorage caching
- **Service Layer:** Axios HTTP client with instant `VITE_USE_MOCK_API` toggle

---

## 📁 Folder Structure

```
├── API_CONTRACT.md          # Complete REST API specification for backend team
├── README.md                # Project documentation & setup instructions
├── metadata.json            # Application metadata & capabilities
├── package.json             # NPM dependencies & build scripts
├── index.html               # Vite HTML entry point
├── src/
│   ├── main.tsx             # Application mount point
│   ├── App.tsx              # Router, Layout, & Context Providers
│   ├── index.css            # Global Tailwind CSS & custom scrollbars
│   ├── types.ts             # TypeScript interfaces & domain models
│   ├── context/
│   │   ├── AuthContext.tsx  # Firebase + Demo Sandbox authentication provider
│   │   └── ThemeContext.tsx # Persistent Dark/Light theme provider
│   ├── components/
│   │   ├── Navbar.tsx             # Responsive header with theme & auth controls
│   │   ├── ScoreGauge.tsx         # Circular SVG 0-100 gauge with sub-scores
│   │   ├── StatCard.tsx           # Financial metric KPI cards with trends
│   │   ├── ActionPlanList.tsx     # Prioritized monthly checklist with completion state
│   │   ├── ChartCard.tsx          # Generic chart wrapper with metadata
│   │   ├── AllocationComparison.tsx # Portfolio benchmark comparison with flags
│   │   ├── ExpenseUploader.tsx    # Drag-and-drop CSV parser with sample generator
│   │   └── SipCalculator.tsx      # Interactive compound interest growth simulator
│   ├── pages/
│   │   ├── Landing.tsx            # High-conversion hero & feature overview
│   │   ├── Login.tsx              # Firebase / Demo credentials sign-in
│   │   ├── Onboarding.tsx         # 3-step baseline metrics & 6-question risk quiz
│   │   ├── Dashboard.tsx          # Central Financial Health command center
│   │   ├── Portfolio.tsx          # Holdings manager & asset class allocation
│   │   ├── ExpenseAnalyzer.tsx    # Statement parser, category breakdowns & trends
│   │   ├── Goals.tsx              # Milestone trackers & SIP requirements
│   │   └── AICoach.tsx            # Narrative synthesis & "What-If" simulator
│   ├── services/
│   │   ├── api.ts                 # Central API service (Mock vs Live backend toggle)
│   │   ├── firebase.ts            # Firebase Authentication initialization
│   │   └── mockData.ts            # Persistent seed data & state manager
│   └── utils/
│       ├── formatters.ts          # Currency, percentage, and date formatters
│       ├── financialCalculations.ts # Health score formula & risk scoring algorithms
│       └── csvParser.ts           # Dynamic CSV parser & insight generator
```

---

## ⚡ Quick Start & Setup

### 1. Installation
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file from `.env.example`:
```env
# Toggle between Local Mock Data (true) or Backend API (false)
VITE_USE_MOCK_API="true"
VITE_API_BASE_URL="http://localhost:5000/api"

# Optional: Firebase Authentication credentials
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID=""
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` to view the application.

---

## 🔌 Backend Integration (Plugging in the Real API)

To switch from standalone mock mode to the live Node/Express/MongoDB backend:
1. Open `.env` and set:
   ```env
   VITE_USE_MOCK_API="false"
   VITE_API_BASE_URL="https://your-backend-api.com/api"
   ```
2. Refer to `API_CONTRACT.md` for the exact endpoint routes and JSON schemas.

---

## ⚖️ Legal & Educational Framing

All analytics, observations, and recommendations within FinWise are framed strictly as **educational observations and mathematical simulations**, explicitly disclaiming regulated financial or investment advice.
