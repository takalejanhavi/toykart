const mongoose = require('mongoose');

// Cart Item Schema
const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

// Cart Schema
const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema], // Changed to 'items' for consistency
  totalPrice: {
    type: Number,
    default: 0
  }
});

// Recalculate totalPrice before saving
cartSchema.pre('save', async function (next) {
  let total = 0;

  for (let item of this.items) {
    const product = await mongoose.model('Product').findById(item.productId); // Corrected product reference
    if (product && product.price) {
      total += item.quantity * product.price;
    }
  }

  this.totalPrice = total;
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
