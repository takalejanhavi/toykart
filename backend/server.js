const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: 'https://toykart.vercel.app', // ✅ Use your frontend's URL without the trailing slash
    credentials: true
}));
app.use(express.json());

// Debugging logs
app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
});

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
console.log('MongoDB URI:', mongoURI); // Debugging DB URI

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({ msg: 'Internal Server Error' });
});
