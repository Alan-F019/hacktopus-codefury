import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Onboarding & Risk Profiling Endpoint', () => {
  it('POST /api/onboarding should successfully compute risk score and return allocation', async () => {
    const payload = {
      name: 'Alex Morgan',
      age: 28,
      monthlyIncome: 7500,
      monthlyExpenses: 4100,
      existingSavings: 24000,
      investmentAmount: 58000,
      financialGoal: 'Buy a Home & Retire Early at 55',
      answers: [16, 12, 12, 12, 10, 10], // sum = 72
    };

    const res = await request(app)
      .post('/api/onboarding')
      .set('Authorization', 'Bearer demo-sandbox-token')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.riskScore).toBe(72);
    expect(res.body.riskLevel).toBe('Aggressive');
    expect(res.body.recommendedAllocation).toEqual({
      Stock: 40,
      ETF: 30,
      'Mutual Fund': 15,
      Gold: 5,
      Cash: 10,
    });
    expect(typeof res.body.initialHealthScore).toBe('number');
    expect(res.body.initialHealthScore).toBeGreaterThan(0);
  });

  it('POST /api/onboarding should return 400 INVALID_ONBOARDING_PAYLOAD for negative income', async () => {
    const payload = {
      name: 'Alex Morgan',
      age: 28,
      monthlyIncome: -500,
      monthlyExpenses: 4100,
      existingSavings: 24000,
      investmentAmount: 58000,
      financialGoal: 'Goal',
      answers: [10, 10],
    };

    const res = await request(app)
      .post('/api/onboarding')
      .set('Authorization', 'Bearer demo-sandbox-token')
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_ONBOARDING_PAYLOAD');
    expect(res.body.message).toContain('monthlyIncome');
  });
});
