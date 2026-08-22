import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('AI Coach Narrative Synthesis', () => {
  it('POST /api/ai-coach should return structured advice and compliance disclaimer', async () => {
    const payload = {
      income: 7500,
      expenses: 4100,
      savings: 24000,
      risk: 'Aggressive',
      portfolio_equity: 58000,
    };

    const res = await request(app)
      .post('/api/ai-coach')
      .set('Authorization', 'Bearer demo-sandbox-token')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('summary');
    expect(res.body).toHaveProperty('healthDiagnosis');
    expect(Array.isArray(res.body.topStrengths)).toBe(true);
    expect(res.body.topStrengths.length).toBe(3);
    expect(Array.isArray(res.body.keyVulnerabilities)).toBe(true);
    expect(Array.isArray(res.body.monthlyRoadmap)).toBe(true);
    expect(res.body.monthlyRoadmap.length).toBe(3);
    expect(res.body.monthlyRoadmap[0]).toHaveProperty('month');
    expect(res.body.monthlyRoadmap[0]).toHaveProperty('focus');
    expect(res.body.monthlyRoadmap[0]).toHaveProperty('action');
    expect(res.body.educationalNote).toContain('Educational insight only');
  });
});
