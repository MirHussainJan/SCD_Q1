const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Comment = require('./models/Comment');
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


// Add Comment
app.post('/comments', auth, async (req, res) => {
  const { blogId, content } = req.body;
  const comment = new Comment({
    blogId,
    content,
    author: req.user.id
  });
  await comment.save();
  res.status(201).json({ message: 'Comment added successfully' });
});

// Get Comments for a Blog
app.get('/comments/:blogId', async (req, res) => {
  const comments = await Comment.find({ blogId: req.params.blogId }).populate('author', 'username');
  res.json(comments);
});

mongoose.connect('mongodb://localhost/comment-service');
app.listen(4003, () => console.log('Comment Service running on 4003'));
