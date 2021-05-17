const mongoose = require('mongoose');

const OrderItemSchema = mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
});

module.exports = mongoose.model('OrderItem', OrderItemSchema);
