const request = require('supertest');
const mongoose = require('mongoose');

describe('Comment Service Integration', () => {
  let token, blogId;
  beforeAll(async () => {
    // Register and login to get JWT
    await request('http://localhost:4001').post('/register').send({ username: 'commentuser', email: 'commentuser@email.com', password: 'testpass' });
    const res = await request('http://localhost:4001').post('/login').send({ email: 'commentuser@email.com', password: 'testpass' });
    token = res.body.token;
    // Create a blog
    const blogRes = await request('http://localhost:4002')
      .post('/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Blog for comment', content: '...' });
    blogId = blogRes.body._id || (await request('http://localhost:4002').get('/blogs')).body[0]._id;
  });
  afterAll(async () => { await mongoose.disconnect(); });
  it('should add a comment with valid JWT', async () => {
    const res = await request('http://localhost:4003')
      .post('/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ blogId, content: 'Nice blog!' });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/added/i);
  });
  it('should reject comment creation without token', async () => {
    const res = await request('http://localhost:4003')
      .post('/comments')
      .send({ blogId, content: 'Should fail' });
    expect(res.statusCode).toBe(401);
  });
});
