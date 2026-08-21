# FinWise Backend API Contract & Specification

This document defines the exact RESTful API contract for the **FinWise** personal financial health dashboard (Codefury 9.0 Hackathon - WealthTech Track).

The frontend service layer (`/src/services/api.ts`) is designed to consume these exact endpoint specifications. In development/standalone mode, it simulates responses from these payloads; when `VITE_USE_MOCK_API=false`, it issues live `axios` requests to `VITE_API_BASE_URL`.

---

## Base Configuration

- **Base URL:** `http://localhost:5000/api` (configurable via `VITE_API_BASE_URL`)
- **Content-Type:** `application/json`
- **Authentication:** `Authorization: Bearer <FIREBASE_ID_TOKEN>`

---

## 1. Onboarding & Risk Profiling

### `POST /api/onboarding`
Submits user baseline financial metrics and risk tolerance questionnaire answers, returning calculated risk metrics and recommended benchmark allocation.

#### Request Body Schema
```json
{
  "name": "Alex Morgan",
  "age": 28,
  "monthlyIncome": 7500,
  "monthlyExpenses": 4100,
  "existingSavings": 24000,
  "investmentAmount": 58000,
  "financialGoal": "Buy a Home & Retire Early at 55",
  "answers": [16, 12, 12, 12, 10, 10]
}
```

#### Response Body (`200 OK`)
```json
{
  "riskScore": 72,
  "riskLevel": "Aggressive",
  "recommendedAllocation": {
    "Stock": 40,
    "ETF": 30,
    "Mutual Fund": 15,
    "Gold": 5,
    "Cash": 10
  },
  "initialHealthScore": 78
}
```

#### Error Response (`400 Bad Request`)
```json
{
  "error": "INVALID_ONBOARDING_PAYLOAD",
  "message": "Monthly income and expense numbers must be non-negative numbers."
}
```

---

## 2. Financial Health Score Engine

### `GET /api/health-score`
Retrieves overall financial health score (0-100), sub-category breakdown, underlying financial ratios, and actionable prioritized monthly recommendations.

#### Response Body (`200 OK`)
```json
{
  "overallScore": 78,
  "status": "Good",
  "lastCalculated": "2026-08-21T12:00:00Z",
  "subScores": {
    "emergencyFund": {
      "score": 85,
      "maxScore": 100,
      "weight": 0.30,
      "status": "Healthy",
      "metricValue": "5.8 Months",
      "benchmark": "3 - 6 Months of expenses",
      "insight": "Your $24,000 cash reserve provides 5.8 months of safety runway."
    },
    "spendingHabits": {
      "score": 75,
      "maxScore": 100,
      "weight": 0.25,
      "status": "Healthy",
      "metricValue": "54.7% Outflow",
      "benchmark": "< 60% of take-home income",
      "insight": "Monthly spending ($4,100) is well contained below the 60% benchmark."
    },
    "investments": {
      "score": 80,
      "maxScore": 100,
      "weight": 0.25,
      "status": "Healthy",
      "metricValue": "13.8% Drift",
      "benchmark": "< 10% drift from risk profile",
      "insight": "Asset allocation is aligned with your Aggressive growth profile with modest cash surplus."
    },
    "goalProgress": {
      "score": 70,
      "maxScore": 100,
      "weight": 0.20,
      "status": "Warning",
      "metricValue": "48.5% Funded",
      "benchmark": "> 50% milestone pacing",
      "insight": "Home down payment milestone is 48.5% funded; on track with recommended SIP pacing."
    }
  },
  "metrics": {
    "monthlyIncome": 7500,
    "monthlyExpenses": 4100,
    "monthlySavings": 3400,
    "savingsRate": 45.3,
    "emergencyFundMonths": 5.8,
    "existingSavings": 24000,
    "investmentAmount": 58000
  },
  "actionPlan": [
    {
      "id": "act-1",
      "title": "Optimize Discretionary Dining & Food",
      "description": "Dining expenses represent 33% of food spend. Trimming $250/mo adds $3,000/yr to your investment compounding.",
      "category": "Spending",
      "priority": "HIGH",
      "completed": false,
      "impact": "+4 Health Pts"
    },
    {
      "id": "act-2",
      "title": "Automate Monthly SIP of $650 for Home Down Payment",
      "description": "Deploy automated monthly transfers into your balanced equity index fund to meet the $50k milestone by 2028.",
      "category": "Goals",
      "priority": "HIGH",
      "completed": false,
      "impact": "+5 Health Pts"
    }
  ]
}
```

---

## 3. Portfolio Management & Asset Allocation

### `GET /api/portfolio`
Returns all tracked individual asset holdings, total valuation, asset class allocation percentages, benchmark targets, and educational drift observations.

#### Response Body (`200 OK`)
```json
{
  "totalValue": 58000,
  "riskProfile": "Aggressive",
  "assets": [
    {
      "id": "asset-1",
      "name": "Vanguard Total Stock Market (VTI)",
      "type": "ETF",
      "amount": 22000,
      "ticker": "VTI",
      "returnsYTD": 12.4
    },
    {
      "id": "asset-2",
      "name": "Apple Inc. (AAPL)",
      "type": "Stock",
      "amount": 14000,
      "ticker": "AAPL",
      "returnsYTD": 18.2
    }
  ],
  "allocations": [
    {
      "type": "Stock",
      "amount": 14000,
      "currentPercent": 24.1,
      "targetPercent": 40.0,
      "variance": -15.9,
      "status": "underweight"
    },
    {
      "type": "ETF",
      "amount": 22000,
      "currentPercent": 37.9,
      "targetPercent": 30.0,
      "variance": 7.9,
      "status": "optimal"
    }
  ],
  "educationalInsights": [
    "Stock allocation (24.1%) is currently 15.9% below your model target (40.0%).",
    "Cash holding is optimal and provides dry powder for market dips."
  ]
}
```

### `POST /api/portfolio/asset`
Adds a new investment position.

#### Request Body Schema
```json
{
  "name": "Schwab International Equity ETF",
  "type": "ETF",
  "amount": 5000,
  "ticker": "SCHF"
}
```

#### Response Body (`201 Created`)
```json
{
  "id": "asset-1724240000000",
  "name": "Schwab International Equity ETF",
  "type": "ETF",
  "amount": 5000,
  "ticker": "SCHF",
  "returnsYTD": 8.5
}
```

### `DELETE /api/portfolio/asset/:id`
Removes an asset position by ID.

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "message": "Asset deleted successfully."
}
```

---

## 4. Expense Statement Intelligence

### `GET /api/expenses`
Retrieves categorized monthly expenses, spend drivers, variance trends, and dynamic algorithmic observations.

#### Response Body (`200 OK`)
```json
{
  "period": "August 2026",
  "totalSpending": 4100,
  "itemCount": 24,
  "categories": [
    {
      "category": "Housing",
      "amount": 1800,
      "percentage": 43.9,
      "color": "#3B82F6",
      "count": 2
    },
    {
      "category": "Food",
      "amount": 750,
      "percentage": 18.3,
      "color": "#10B981",
      "count": 12
    }
  ],
  "monthlyTrends": [
    { "month": "May", "amount": 3950, "budget": 4200 },
    { "month": "Jun", "amount": 4200, "budget": 4200 },
    { "month": "Jul", "amount": 3800, "budget": 4200 },
    { "month": "Aug", "amount": 4100, "budget": 4200 }
  ],
  "recentTransactions": [
    {
      "id": "tx-1",
      "date": "2026-08-01",
      "description": "Monthly Residential Rent Transfer",
      "amount": 1800,
      "category": "Housing"
    }
  ],
  "dynamicInsights": [
    "Housing represents 43.9% of total monthly expenses.",
    "Food spending increased 18% vs July average.",
    "Discretionary spending is well contained below 30% of total outflow."
  ]
}
```

### `POST /api/expenses/upload`
Uploads raw CSV text or file containing bank statement records (`Date, Description, Amount, Category`).

#### Request Body Schema
```json
{
  "csvData": "Date,Description,Amount,Category\n2026-08-01,Rent,1800,Housing\n2026-08-02,Trader Joes,140,Food"
}
```

---

## 5. Wealth Goals & SIP Projection

### `GET /api/goals`
Returns all active financial milestones, target dates, progress percentages, and computed SIP contributions.

#### Response Body (`200 OK`)
```json
[
  {
    "id": "goal-1",
    "name": "Dream Home Down Payment",
    "category": "House",
    "targetAmount": 50000,
    "currentAmount": 24250,
    "timeHorizonYears": 3,
    "targetDate": "2029-08-21",
    "progressPercent": 48.5,
    "requiredMonthlySavings": 715.28,
    "expectedAnnualReturn": 8.0,
    "sipMonthlyRequired": 580.40
  }
]
```

### `POST /api/goals`
Creates a new financial milestone.

#### Request Body Schema
```json
{
  "name": "New Electric Vehicle",
  "category": "Vehicle",
  "targetAmount": 30000,
  "currentAmount": 5000,
  "timeHorizonYears": 2,
  "expectedAnnualReturn": 7.0
}
```

### `POST /api/goals/:id/deposit`
Logs a contribution toward an existing goal.

#### Request Body Schema
```json
{
  "amount": 500
}
```

---

## 6. AI Wealth Coach Narrative Engine

### `POST /api/ai-coach`
Generates a structured narrative evaluation, diagnosis, strength/vulnerability breakdown, and 3-month tactical execution roadmap.

#### Request Body Schema
```json
{
  "income": 7500,
  "expenses": 4100,
  "savings": 24000,
  "risk": "Aggressive",
  "portfolio_equity": 58000
}
```

#### Response Body (`200 OK`)
```json
{
  "summary": "Your financial profile reflects disciplined savings habits with a 45.3% savings rate and $3,400 monthly surplus. Your $24,000 liquid reserves grant a healthy 5.8-month emergency cushion, providing resilient protection against unforeseen market shocks while aggressively pursuing capital growth.",
  "healthDiagnosis": "Strong Liquidity & Growth Phase — Optimal runway buffer allows higher equity exposure with minimal liquidity risk.",
  "topStrengths": [
    "Robust 45.3% Net Monthly Savings Rate",
    "5.8 Months of Liquid Emergency Runway",
    "Well-Diversified $58k Core Investment Portfolio"
  ],
  "keyVulnerabilities": [
    "Slight cash drag in portfolio vs Aggressive model target",
    "Discretionary dining & entertainment variance (+18% MoM)",
    "Unautomated monthly milestone deposits"
  ],
  "monthlyRoadmap": [
    {
      "month": "Month 1",
      "focus": "Automated Deployment",
      "action": "Set up recurring auto-debit of $650/mo into low-cost broad index ETFs."
    },
    {
      "month": "Month 2",
      "focus": "Budget Re-calibration",
      "action": "Cap dining expenses at $500/mo to divert an additional $250 toward down payment goal."
    },
    {
      "month": "Month 3",
      "focus": "Portfolio Rebalancing",
      "action": "Rebalance underweight individual stock positions to maintain your target 40% equity weighting."
    }
  ],
  "educationalNote": "Educational insight only. FinWise provides algorithmic financial data simulations and does not offer regulated investment advice."
}
```
