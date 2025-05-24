const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Blog = require('./models/Blog');
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


const View = require('./models/View');

// Create Blog
app.post('/blogs', auth, async (req, res) => {
  const { title, content } = req.body;
  const blog = new Blog({ title, content, author: req.user.id });
  await blog.save();
  const blogView = new View({ blogId: blog._id });
  await blogView.save();
  res.status(201).json({ message: 'Blog created successfully' });
});

// Get Blogs
app.get('/blogs', async (req, res) => {
  const blogs = await Blog.find().populate('author', 'username');
  res.json(blogs);
});

// Increment blog views
app.post('/blogs/:blogId/views', async (req, res) => {
  const { blogId } = req.params;
  const view = await View.findOne({ blogId });
  if (view) {
    view.views++;
    await view.save();
  } else {
    const newView = new View({ blogId, views: 1 });
    await newView.save();
  }
  res.status(200).json({ message: 'View count incremented' });
});

// Delete Blog (only by creator)
app.delete('/blogs/:id', auth, async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ message: 'Not found' });
  if (blog.author.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  await blog.remove();
  res.json({ message: 'Deleted' });
});

mongoose.connect('mongodb://localhost/blog-service');
app.listen(4002, () => console.log('Blog Service running on 4002'));
