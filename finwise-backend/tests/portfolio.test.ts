import request from 'supertest';
import { createApp } from '../src/app';
import { Asset } from '../src/models/Asset';

const app = createApp();

describe('Portfolio CRUD and Allocation Engine', () => {
  it('GET /api/portfolio should return assets, totalValue, allocations with variance, and insights', async () => {
    await Asset.create([
      { userId: 'user-demo-42', name: 'Apple Inc', type: 'Stock', amount: 14000, ticker: 'AAPL' },
      { userId: 'user-demo-42', name: 'Vanguard Total Stock', type: 'ETF', amount: 22000, ticker: 'VTI' },
    ]);

    const res = await request(app)
      .get('/api/portfolio')
      .set('Authorization', 'Bearer demo-sandbox-token');

    expect(res.status).toBe(200);
    expect(res.body.totalValue).toBe(36000);
    expect(res.body.assets.length).toBe(2);
    expect(res.body.allocations.length).toBeGreaterThan(0);
    expect(Array.isArray(res.body.educationalInsights)).toBe(true);
  });

  it('POST /api/portfolio/asset and DELETE /api/portfolio/asset/:id', async () => {
    const postRes = await request(app)
      .post('/api/portfolio/asset')
      .set('Authorization', 'Bearer demo-sandbox-token')
      .send({
        name: 'Schwab International Equity ETF',
        type: 'ETF',
        amount: 5000,
        ticker: 'SCHF',
      });

    expect(postRes.status).toBe(201);
    expect(postRes.body.name).toBe('Schwab International Equity ETF');
    expect(postRes.body.id).toBeDefined();

    const assetId = postRes.body.id;

    const deleteRes = await request(app)
      .delete(`/api/portfolio/asset/${assetId}`)
      .set('Authorization', 'Bearer demo-sandbox-token');

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
  });
});
