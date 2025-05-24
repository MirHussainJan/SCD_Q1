const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Readiness check endpoint
app.get('/ready', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.status(200).json({ ready: true });
  } else {
    res.status(503).json({ ready: false });
  }
});

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, 'SECRET');
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}


// Update Profile
app.post('/profile', auth, async (req, res) => {
  const { bio, avatar } = req.body;
  const user = await User.findById(req.user.id);
  if (bio) user.profile.bio = bio;
  if (avatar) user.profile.avatar = avatar;
  await user.save();
  res.status(200).json({ message: 'Profile updated successfully' });
});

// Get Profile
app.get('/profile', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user.profile);
});

mongoose.connect('mongodb://localhost/profile-service');
app.listen(4004, () => console.log('Profile Service running on 4004'));
