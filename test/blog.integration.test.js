const request = require('supertest');
const app = require('../blog-service/server');
const mongoose = require('mongoose');

describe('Blog Service Integration', () => {
  let token;
  beforeAll(async () => {
    // Register and login to get JWT
    await request('http://localhost:4001').post('/register').send({ username: 'bloguser', email: 'bloguser@email.com', password: 'testpass' });
    const res = await request('http://localhost:4001').post('/login').send({ email: 'bloguser@email.com', password: 'testpass' });
    token = res.body.token;
  });
  afterAll(async () => { await mongoose.disconnect(); });
  it('should create a blog with valid JWT', async () => {
    const res = await request('http://localhost:4002')
      .post('/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Blog', content: 'Blog content' });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/created/i);
  });
});
