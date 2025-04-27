const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS setup
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://toykart.vercel.app', // safer, fallback
  credentials: true,
}));

app.use(express.json());

// Debugging logs (optional)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Import Routes
const authRoute = require('./routes/auth');
const productRoute = require('./routes/product');
const cartRoute = require('./routes/cart');
const checkoutRoute = require('./routes/checkout');

// Mount Routes
app.use('/api/auth', authRoute);
app.use('/api/products', productRoute);
app.use('/api/cart', cartRoute);
app.use('/api/checkout', checkoutRoute);

// MongoDB Atlas Connection
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');
  
  // Start server only after MongoDB is connected
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1); // Stop server if DB fails
});

// 404 Handler (for unmatched routes)
app.use((req, res, next) => {
  res.status(404).json({ msg: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ msg: 'Internal Server Error' });
});
