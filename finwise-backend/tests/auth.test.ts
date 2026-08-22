import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Auth Middleware & Health Liveness', () => {
  it('GET /api/health should be open and return 200 without token', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/user/profile should return 401 UNAUTHORIZED when no token is provided', async () => {
    const res = await request(app).get('/api/user/profile');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('UNAUTHORIZED');
  });

  it('GET /api/user/profile should accept demo-sandbox-token and return profile', async () => {
    const res = await request(app)
      .get('/api/user/profile')
      .set('Authorization', 'Bearer demo-sandbox-token');

    expect(res.status).toBe(200);
    expect(res.body.uid).toBe('user-demo-42');
    expect(res.body.name).toBe('Alex Morgan');
    expect(res.body.monthlyIncome).toBe(7500);
  });
});
