const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
  },
  icon: {
    type: String,
  },
});

module.exports = mongoose.model('Category', CategorySchema);
