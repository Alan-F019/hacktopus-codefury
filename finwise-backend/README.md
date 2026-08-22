# FinWise Backend API

Production-quality Node.js/Express/MongoDB API for the **FinWise** personal financial health dashboard (Codefury 9.0 Hackathon - WealthTech Track).

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd finwise-backend
npm install
```

### 2. Environment Configuration
Create a `.env` file based on `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/finwise
DEMO_TOKEN=demo-sandbox-token
CORS_ORIGIN=http://localhost:3000
AI_COACH_PROVIDER=none
AI_COACH_API_KEY=
```

### 3. Seed Demo Data (Optional for local testing)
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
The server will start at `http://localhost:5000/api`.

### 5. Run Test Suite
```bash
npm test
```

---

## 🔒 Authentication & Sandbox Mode

- **Production Mode**: Pass Firebase ID token in `Authorization: Bearer <FIREBASE_ID_TOKEN>`.
- **Demo Sandbox Mode**: Pass `Authorization: Bearer demo-sandbox-token` to automatically bind to the judge demo account (`user-demo-42`) without needing live Firebase keys.

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service liveness check | No |
| `GET` | `/api/user/profile` | Current user profile | Yes |
| `POST` | `/api/onboarding` | Submit risk questionnaire & baseline metrics | Yes |
| `GET` | `/api/health-score` | Compute 4-factor composite score & action plan | Yes |
| `GET` | `/api/portfolio` | Get holdings, allocation % and drift vs benchmark | Yes |
| `POST` | `/api/portfolio/asset` | Add new investment asset position | Yes |
| `DELETE` | `/api/portfolio/asset/:id` | Remove investment asset position | Yes |
| `GET` | `/api/expenses` | Get categorized spend, 4-mo trends & insights | Yes |
| `POST` | `/api/expenses/upload` | Parse CSV statement (JSON or multipart upload) | Yes |
| `GET` | `/api/goals` | Get goals with compounding SIP & progress | Yes |
| `POST` | `/api/goals` | Create new wealth goal milestone | Yes |
| `POST/PATCH` | `/api/goals/:id/deposit` | Contribution deposit into existing goal | Yes |
| `DELETE` | `/api/goals/:id` | Delete wealth goal milestone | Yes |
| `POST` | `/api/ai-coach` | Rule-based & LLM financial narrative synthesis | Yes |

---

## 📦 Deployment (Render / Railway)

1. **Build Command**: `npm run build`
2. **Start Command**: `npm start`
3. **Environment Variables**:
   - `MONGODB_URI`: MongoDB Atlas connection string (`mongodb+srv://...`)
   - `PORT`: `5000` (or injected by platform)
   - `DEMO_TOKEN`: `demo-sandbox-token`
   - `CORS_ORIGIN`: Your deployed frontend URL (e.g. `https://finwise.vercel.app`)
4. In the frontend `.env`, set:
   ```env
   VITE_API_BASE_URL=https://<your-backend-url>/api
   VITE_USE_MOCK_API=false
   ```
