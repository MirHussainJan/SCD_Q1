const mongoose = require('mongoose');
const ViewSchema = new mongoose.Schema({
  blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
  views: { type: Number, default: 0 }
});
module.exports = mongoose.model('View', ViewSchema);
