// tests/auth.test.js
const request = require('supertest');
//
const { connect, close } = require('./setup-db');
const User = require('../models/userModel');

let app;

describe('Auth', () => {
  beforeAll(async () => {
    await connect();
    app = require('../index');
    await User.deleteMany({});
  });

  it('registers and logs in', async () => {
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test1@x.com', password: 'pass' });
    expect(res1.statusCode).toBe(201);

    const res2 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test1@x.com', password: 'pass' });
    expect(res2.statusCode).toBe(200);
  });
});

afterAll(async () => {
  await close();
});

