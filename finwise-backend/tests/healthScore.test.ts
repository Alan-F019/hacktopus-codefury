import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { Asset } from '../src/models/Asset';
import { Goal } from '../src/models/Goal';

const app = createApp();

describe('Health Score Engine Endpoint', () => {
  beforeEach(async () => {
    await User.create({
      firebaseUid: 'user-demo-42',
      name: 'Alex Morgan',
      email: 'alex@demo.com',
      monthlyIncome: 7500,
      monthlyExpenses: 4100,
      existingSavings: 24000,
      investmentAmount: 58000,
      riskLevel: 'Aggressive',
      recommendedAllocation: {
        Stock: 40,
        ETF: 30,
        'Mutual Fund': 15,
        Gold: 5,
        Cash: 10,
      },
    });

    await Asset.create([
      { userId: 'user-demo-42', name: 'Stock A', type: 'Stock', amount: 20000 },
      { userId: 'user-demo-42', name: 'ETF B', type: 'ETF', amount: 20000 },
      { userId: 'user-demo-42', name: 'Cash C', type: 'Cash', amount: 18000 },
    ]);

    await Goal.create({
      userId: 'user-demo-42',
      name: 'Home Down Payment',
      category: 'House',
      targetAmount: 50000,
      currentAmount: 25000,
      timeHorizonYears: 3,
    });
  });

  it('GET /api/health-score should return composite score, 4 subScores, metrics, and actionPlan', async () => {
    const res = await request(app)
      .get('/api/health-score')
      .set('Authorization', 'Bearer demo-sandbox-token');

    expect(res.status).toBe(200);
    expect(typeof res.body.overallScore).toBe('number');
    expect(['Excellent', 'Good', 'Fair', 'Needs Attention']).toContain(res.body.status);

    // Verify subScores structure
    const { emergencyFund, spendingHabits, investments, goalProgress } = res.body.subScores;
    expect(emergencyFund).toBeDefined();
    expect(emergencyFund.weight).toBe(0.3);
    expect(spendingHabits).toBeDefined();
    expect(spendingHabits.weight).toBe(0.25);
    expect(investments).toBeDefined();
    expect(investments.weight).toBe(0.25);
    expect(goalProgress).toBeDefined();
    expect(goalProgress.weight).toBe(0.2);

    // Verify metrics
    expect(res.body.metrics.monthlyIncome).toBe(7500);
    expect(res.body.metrics.monthlyExpenses).toBe(4100);
    expect(res.body.metrics.emergencyFundMonths).toBeCloseTo(24000 / 4100, 1);

    // Verify actionPlan
    expect(Array.isArray(res.body.actionPlan)).toBe(true);
    expect(res.body.actionPlan.length).toBeGreaterThan(0);
    expect(res.body.actionPlan[0]).toHaveProperty('title');
    expect(res.body.actionPlan[0]).toHaveProperty('impact');
    expect(res.body.actionPlan[0]).toHaveProperty('priority');
  });
});
