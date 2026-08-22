import request from 'supertest';
import { createApp } from '../src/app';
import { Transaction } from '../src/models/Transaction';

const app = createApp();

describe('Expenses & CSV Parsing Endpoint', () => {
  it('POST /api/expenses/upload should parse CSV string and insert transactions', async () => {
    const csvData = `Date,Description,Amount,Category
2026-08-01,Apartment Rent,1800,Housing
2026-08-02,Whole Foods,150,Food
2026-08-03,Gas Station,50,Transportation`;

    const res = await request(app)
      .post('/api/expenses/upload')
      .set('Authorization', 'Bearer demo-sandbox-token')
      .send({ csvData });

    expect(res.status).toBe(200);
    expect(res.body.insertedCount).toBe(3);
    expect(res.body.categories.length).toBe(3);
    expect(res.body.totalSpending).toBe(2000);
    expect(res.body.recentTransactions.length).toBe(3);
  });

  it('GET /api/expenses should return structured categories and trends', async () => {
    await Transaction.create([
      { userId: 'user-demo-42', date: '2026-08-01', description: 'Rent', amount: 1800, category: 'Housing' },
      { userId: 'user-demo-42', date: '2026-08-02', description: 'Groceries', amount: 750, category: 'Food' },
    ]);

    const res = await request(app)
      .get('/api/expenses')
      .set('Authorization', 'Bearer demo-sandbox-token');

    expect(res.status).toBe(200);
    expect(res.body.totalSpending).toBe(2550);
    expect(res.body.categories.length).toBe(2);
    expect(res.body.categories[0].category).toBe('Housing');
    expect(res.body.categories[0].percentage).toBeCloseTo((1800 / 2550) * 100, 1);
  });
});
