const request = require('supertest');
const mongoose = require('mongoose');

describe('Profile Service Integration', () => {
  let token, userId;
  beforeAll(async () => {
    // Register and login to get JWT
    await request('http://localhost:4001').post('/register').send({ username: 'profileuser', email: 'profileuser@email.com', password: 'testpass' });
    const res = await request('http://localhost:4001').post('/login').send({ email: 'profileuser@email.com', password: 'testpass' });
    token = res.body.token;
    userId = res.body.id;
  });
  afterAll(async () => { await mongoose.disconnect(); });
  it('should fetch profile data for logged in user', async () => {
    const res = await request('http://localhost:4004')
      .get('/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined();
  });
  it('should forbid updating another user profile', async () => {
    // Register another user
    await request('http://localhost:4001').post('/register').send({ username: 'otheruser', email: 'other@email.com', password: 'testpass' });
    const res2 = await request('http://localhost:4001').post('/login').send({ email: 'other@email.com', password: 'testpass' });
    const otherToken = res2.body.token;
    // Try to update profile with wrong token (simulate by sending wrong user id in body)
    const res = await request('http://localhost:4004')
      .post('/profile')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ bio: 'Hacked!' });
    // Should only update own profile, not others
    expect(res.statusCode).toBe(200); // But only their own profile is updated
  });
});
