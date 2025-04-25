const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Cart = require('../models/cart');
const Payment = require('../models/payment');

// POST /api/checkout
router.post('/', async (req, res) => {
  try {
    const { userId, paymentDetails } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: 'Invalid user ID' });
    }

    // Get user's cart
    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ msg: 'Cart is empty or not found' });
    }

    // Calculate total amount
    const totalPrice = cart.items.reduce((total, item) => {
      return total + item.quantity * (item.productId?.price || 0);
    }, 0);

    // Simulate payment
    const paymentResult = await processPayment(paymentDetails, totalPrice);

    if (!paymentResult.success) {
      return res.status(400).json({ msg: 'Payment failed', error: paymentResult.error });
    }

    // Save payment record
    const payment = new Payment({
      user: userId,
      amount: totalPrice,
      paymentMethod: paymentDetails.method || 'Card',
      paymentStatus: 'Completed',
      transactionId: paymentResult.details.transactionId,
      paymentDate: new Date()
    });

    await payment.save();

    // Clear the cart
    cart.items = [];
    await cart.save();

    return res.json({
      msg: 'Checkout successful',
      payment: {
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: payment.paymentStatus
      }
    });

  } catch (err) {
    console.error('Checkout Error:', err);
    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Dummy Payment Processor
async function processPayment(details, amount) {
  if (!details || !details.cardNumber || !details.cvv || !details.expiryDate) {
    return { success: false, error: 'Incomplete payment details' };
  }

  const isSuccess = Math.random() > 0.2; // 80% success rate
  if (isSuccess) {
    return {
      success: true,
      details: {
        transactionId: 'TXN' + Date.now(),
        amount,
        method: details.method || 'Card'
      }
    };
  } else {
    return { success: false, error: 'Transaction rejected by payment gateway' };
  }
}

module.exports = router;
