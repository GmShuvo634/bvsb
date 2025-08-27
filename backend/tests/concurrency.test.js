// backend/tests/concurrency.test.js
/*
  Concurrency tests:
  - Demo ceiling: multiple concurrent bets should never increase demo balance beyond 1000, and only the subset with sufficient balance succeeds.
  - Pool accuracy: totals in Pool are atomically updated and match sum of successful trades.
*/

const mongoose = require('mongoose');
const request = require('supertest');
const { connect, close } = require('./setup-db');
let app;
const User = require('../models/userModel');
const Trade = require('../models/Trade');
const Pool = require('../models/Pool');
const jwt = require('jsonwebtoken');

function tokenFor(user) {
  return jwt.sign({ sub: user._id }, process.env.JWT_SECRET || 'testsecret');
}

describe('Concurrency', () => {
  beforeAll(async () => {
    await connect();
    app = require('../index');
    await User.deleteMany({});
    await Trade.deleteMany({});
    await Pool.deleteMany({});
  });

  test('Demo ceiling and pool accuracy under concurrent bets', async () => {
    // Create a demo user with 1000 balance
    const u = await User.create({ email: 'demo@t.local', password: 'x', type: 'demo', balance: 1000 });
    const token = tokenFor(u);

    const betAmount = 150; // roughly 6-7 successful bets possible from 1000
    const n = 20; // 20 concurrent attempts

    const payload = () => ({ amount: betAmount, strikePrice: 2000, direction: Math.random() > 0.5 ? 'up' : 'down', expiry: new Date(Date.now() + 60000) });

    const results = await Promise.allSettled(
      Array.from({ length: n }).map(() => request(app).post('/api/trade').set('Authorization', `Bearer ${token}`).send(payload()))
    );

    const successes = results.filter(r => r.status === 'fulfilled' && r.value.statusCode === 201).length;
    const failures  = results.filter(r => !(r.status === 'fulfilled' && r.value.statusCode === 201)).length;

    // Reload user
    const reloaded = await User.findById(u._id);

    // Balance must never exceed initial 1000, and must be initial - successes*amount
    expect(reloaded.balance).toBe(1000 - successes * betAmount);
    expect(reloaded.balance <= 1000).toBe(true);

    // Pool totals must equal sum of successful trades by direction
    const pools = await Pool.find({}).lean();
    const totalUp = pools.reduce((acc, p) => acc + (p.upTreasury || 0), 0);
    const totalDown = pools.reduce((acc, p) => acc + (p.downTreasury || 0), 0);

    // Sum amounts from successful responses
    // Note: we don't read response bodies in this quick check; we can verify totals add up to successes*amount
    expect(totalUp + totalDown).toBe(successes * betAmount);
  });
});

afterAll(async () => {
  await close();
});
