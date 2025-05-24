const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
const app = express();

// JWT verification middleware
function verifyJWT(req, res, next) {
  if (req.path === '/auth/login' || req.path === '/auth/register') return next();
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, 'SECRET');
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Readiness check endpoint
app.get('/ready', (req, res) => {
  // For gateway, just return ready if server is up
  res.status(200).json({ ready: true });
});

// Auth routes
app.use('/auth', createProxyMiddleware({ target: 'http://localhost:4001', changeOrigin: true }));
// Blog routes
app.use('/blogs', verifyJWT, createProxyMiddleware({ target: 'http://localhost:4002', changeOrigin: true }));
// Comment routes
app.use('/comments', verifyJWT, createProxyMiddleware({ target: 'http://localhost:4003', changeOrigin: true }));
// Profile routes
app.use('/profile', verifyJWT, createProxyMiddleware({ target: 'http://localhost:4004', changeOrigin: true }));

app.listen(4000, () => console.log('API Gateway running on 4000'));
