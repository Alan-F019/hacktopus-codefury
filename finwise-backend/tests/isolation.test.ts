import request from 'supertest';
import { createApp } from '../src/app';
import { Asset } from '../src/models/Asset';
import { Goal } from '../src/models/Goal';

const app = createApp();

describe('Multi-Tenant Data Isolation', () => {
  it('User B cannot read, update, or delete User A assets or goals', async () => {
    // 1. User A creates an asset and a goal
    const userAAsset = await Asset.create({
      userId: 'user-a-111',
      name: 'User A Secret Stock',
      type: 'Stock',
      amount: 50000,
    });

    const userAGoal = await Goal.create({
      userId: 'user-a-111',
      name: 'User A Retirement',
      category: 'Retirement',
      targetAmount: 100000,
      currentAmount: 20000,
      timeHorizonYears: 10,
    });

    // 2. User B tries to view portfolio -> should not see User A's asset
    const userBPortfolio = await request(app)
      .get('/api/portfolio')
      .set('Authorization', 'Bearer user-b-222');

    expect(userBPortfolio.status).toBe(200);
    expect(userBPortfolio.body.assets.length).toBe(0);
    expect(userBPortfolio.body.totalValue).toBe(0);

    // 3. User B tries to delete User A's asset -> should return 404
    const userBDeleteAsset = await request(app)
      .delete(`/api/portfolio/asset/${userAAsset._id}`)
      .set('Authorization', 'Bearer user-b-222');

    expect(userBDeleteAsset.status).toBe(404);
    expect(userBDeleteAsset.body.error).toBe('ASSET_NOT_FOUND');

    // 4. User B tries to deposit into User A's goal -> should return 404
    const userBDepositGoal = await request(app)
      .post(`/api/goals/${userAGoal._id}/deposit`)
      .set('Authorization', 'Bearer user-b-222')
      .send({ amount: 1000 });

    expect(userBDepositGoal.status).toBe(404);
    expect(userBDepositGoal.body.error).toBe('GOAL_NOT_FOUND');

    // 5. User B tries to delete User A's goal -> should return 404
    const userBDeleteGoal = await request(app)
      .delete(`/api/goals/${userAGoal._id}`)
      .set('Authorization', 'Bearer user-b-222');

    expect(userBDeleteGoal.status).toBe(404);
    expect(userBDeleteGoal.body.error).toBe('GOAL_NOT_FOUND');
  });
});
