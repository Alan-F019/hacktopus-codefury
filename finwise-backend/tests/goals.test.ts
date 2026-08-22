import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Wealth Goals and Annuity SIP Projections', () => {
  it('POST /api/goals, deposit, and GET /api/goals', async () => {
    // 1. Create Goal
    const createRes = await request(app)
      .post('/api/goals')
      .set('Authorization', 'Bearer demo-sandbox-token')
      .send({
        name: 'New Electric Vehicle',
        category: 'Vehicle',
        targetAmount: 30000,
        currentAmount: 5000,
        timeHorizonYears: 2,
        expectedAnnualReturn: 7.0,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.name).toBe('New Electric Vehicle');
    expect(createRes.body.progressPercent).toBeCloseTo((5000 / 30000) * 100, 1);
    expect(createRes.body.requiredMonthlySavings).toBeGreaterThan(0);
    expect(createRes.body.sipMonthlyRequired).toBeGreaterThan(0);

    const goalId = createRes.body.id;

    // 2. Deposit into Goal
    const depositRes = await request(app)
      .post(`/api/goals/${goalId}/deposit`)
      .set('Authorization', 'Bearer demo-sandbox-token')
      .send({ amount: 1000 });

    expect(depositRes.status).toBe(200);
    expect(depositRes.body.currentAmount).toBe(6000);
    expect(depositRes.body.progressPercent).toBe(20.0);

    // 3. Deposit via PATCH
    const patchRes = await request(app)
      .patch(`/api/goals/${goalId}/deposit`)
      .set('Authorization', 'Bearer demo-sandbox-token')
      .send({ amount: 500 });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.currentAmount).toBe(6500);

    // 4. Get all Goals
    const getRes = await request(app)
      .get('/api/goals')
      .set('Authorization', 'Bearer demo-sandbox-token');

    expect(getRes.status).toBe(200);
    expect(getRes.body.length).toBe(1);
    expect(getRes.body[0].id).toBe(goalId);

    // 5. Delete Goal
    const delRes = await request(app)
      .delete(`/api/goals/${goalId}`)
      .set('Authorization', 'Bearer demo-sandbox-token');

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);
  });
});
