import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Asset } from '../models/Asset.js';
import { Goal } from '../models/Goal.js';
import { Transaction } from '../models/Transaction.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { parseExpenseCSVServer } from '../utils/csvParser.js';

const DEMO_USER_ID = 'user-demo-42';

const SAMPLE_CSV = `Date,Description,Amount,Category
2026-08-01,Apartment Rent,1450.00,Housing
2026-08-02,Whole Foods Groceries,142.50,Food
2026-08-03,Metro Transit Pass,85.00,Transportation
2026-08-04,Electric & Gas Utility,110.20,Utilities
2026-08-05,Trader Joe's Supermarket,94.30,Food
2026-08-07,Netflix & Spotify Subscriptions,34.98,Entertainment
2026-08-08,Downtown Sushi Dinner,78.50,Food
2026-08-10,Amazon Tech Gadgets,129.99,Shopping
2026-08-12,Pharmacy & Vitamins,45.00,Health
2026-08-14,Gym Membership,65.00,Health
2026-08-15,Uber Rides,48.20,Transportation
2026-08-17,Dinner with Colleagues,92.00,Food
2026-08-19,Home Internet Fiber,70.00,Utilities
2026-08-20,Clothing Store,145.00,Shopping
2026-08-22,Gasoline Refuel,55.00,Transportation
2026-08-24,Online Course Certification,120.00,Education
2026-08-26,Weekend Coffee & Bakery,32.40,Food
2026-08-28,Concert Tickets,110.00,Entertainment
2026-08-29,Mobile Phone Bill,60.00,Utilities
2026-08-30,Organic Farmers Market,88.40,Food
2026-07-01,Apartment Rent,1450.00,Housing
2026-07-03,Supermarket Essentials,135.00,Food
2026-07-06,Electric & Water,125.00,Utilities
2026-07-09,Italian Bistro,85.00,Food
2026-07-12,Metro Card Reload,85.00,Transportation
2026-07-15,Streaming Services,34.98,Entertainment
2026-07-18,Weekend Getaway Train,140.00,Travel
2026-07-22,Department Store,85.50,Shopping
2026-07-25,Health Clinic Co-pay,35.00,Health
2026-07-29,Dining Out,62.00,Food
2026-06-01,Apartment Rent,1450.00,Housing
2026-06-04,Groceries Bulk,160.00,Food
2026-06-10,Utilities Energy,95.00,Utilities
2026-06-15,Transit Pass,85.00,Transportation
2026-06-20,Dinner & Drinks,70.00,Food
2026-06-25,Cinema & Snacks,42.00,Entertainment
2026-06-28,New Shoes,90.00,Shopping`;

export const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting FinWise database seed...');

    // Clean up existing demo data
    await User.deleteMany({ firebaseUid: DEMO_USER_ID });
    await Asset.deleteMany({ userId: DEMO_USER_ID });
    await Goal.deleteMany({ userId: DEMO_USER_ID });
    await Transaction.deleteMany({ userId: DEMO_USER_ID });

    // 1. Create Demo User
    const demoUser = await User.create({
      firebaseUid: DEMO_USER_ID,
      name: 'Alex Morgan',
      email: 'alex.morgan@finwise.demo',
      age: 28,
      monthlyIncome: 7500,
      monthlyExpenses: 4100,
      existingSavings: 24000,
      investmentAmount: 58000,
      financialGoal: 'Buy a Home & Retire Early at 55',
      riskScore: 72,
      riskLevel: 'Aggressive',
      recommendedAllocation: {
        Stock: 40,
        ETF: 30,
        'Mutual Fund': 15,
        Gold: 5,
        Cash: 10,
      },
      isOnboarded: true,
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });
    console.log(`👤 Created Demo User: ${demoUser.name} (${demoUser.firebaseUid})`);

    // 2. Create Assets
    const demoAssets = [
      { userId: DEMO_USER_ID, name: 'Vanguard Total World Stock (VT)', type: 'ETF', amount: 22000, ticker: 'VT', returnsYTD: 14.2 },
      { userId: DEMO_USER_ID, name: 'S&P 500 Index Fund (VOO)', type: 'ETF', amount: 16000, ticker: 'VOO', returnsYTD: 18.5 },
      { userId: DEMO_USER_ID, name: 'Apple Inc. (AAPL)', type: 'Stock', amount: 8500, ticker: 'AAPL', returnsYTD: 9.4 },
      { userId: DEMO_USER_ID, name: 'Fidelity Blue Chip Growth', type: 'Mutual Fund', amount: 6500, ticker: 'FBGRX', returnsYTD: 12.1 },
      { userId: DEMO_USER_ID, name: 'Physical Gold Sovereign ETF', type: 'Gold', amount: 2500, ticker: 'GLD', returnsYTD: 8.7 },
      { userId: DEMO_USER_ID, name: 'High-Yield Liquid Cash Reserve', type: 'Cash', amount: 2500, returnsYTD: 4.8 },
    ];
    await Asset.insertMany(demoAssets);
    console.log(`💼 Seeded ${demoAssets.length} portfolio assets.`);

    // 3. Create Goals
    const demoGoals = [
      {
        userId: DEMO_USER_ID,
        name: 'Home Down Payment',
        category: 'House',
        targetAmount: 75000,
        currentAmount: 32000,
        timeHorizonYears: 3,
        targetDate: '2029-08-01',
        expectedAnnualReturn: 7.5,
      },
      {
        userId: DEMO_USER_ID,
        name: '6-Month Emergency Safety Fund',
        category: 'Emergency',
        targetAmount: 25000,
        currentAmount: 24000,
        timeHorizonYears: 0.5,
        targetDate: '2027-02-01',
        expectedAnnualReturn: 4.5,
      },
      {
        userId: DEMO_USER_ID,
        name: 'Early Financial Independence (FIRE)',
        category: 'Retirement',
        targetAmount: 750000,
        currentAmount: 58000,
        timeHorizonYears: 18,
        targetDate: '2044-08-01',
        expectedAnnualReturn: 10.0,
      },
      {
        userId: DEMO_USER_ID,
        name: 'European Sabbatical Trip',
        category: 'Travel',
        targetAmount: 8000,
        currentAmount: 4800,
        timeHorizonYears: 1,
        targetDate: '2027-08-01',
        expectedAnnualReturn: 5.0,
      },
    ];
    await Goal.insertMany(demoGoals);
    console.log(`🎯 Seeded ${demoGoals.length} wealth goals.`);

    // 4. Create Transactions
    const { transactions } = parseExpenseCSVServer(SAMPLE_CSV);
    const txDocs = transactions.map((t) => ({
      userId: DEMO_USER_ID,
      date: t.date,
      description: t.description,
      amount: t.amount,
      category: t.category,
    }));
    await Transaction.insertMany(txDocs);
    console.log(`📊 Seeded ${txDocs.length} expense transactions.`);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await disconnectDB();
  }
};

if (process.argv[1]?.includes('seed')) {
  seedDatabase();
}
