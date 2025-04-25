const express = require('express');
const mongoose = require('mongoose');
const Cart = require('../models/cart');
const Product = require('../models/product');
const router = express.Router();

// Add product to cart
// POST /api/cart/add
router.post('/add', async (req, res) => {
    let { userId, productId, quantity } = req.body;

    try {
        console.log('Request body:', req.body);

        // Validate ObjectIds
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ msg: "Invalid userId or productId" });
        }

        userId = new mongoose.Types.ObjectId(userId);
        productId = new mongoose.Types.ObjectId(productId);
        quantity = parseInt(quantity);

        if (quantity <= 0) {
            return res.status(400).json({ msg: "Quantity must be greater than 0" });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ msg: "Product not found" });

        // Find or create user's cart
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, products: [], totalPrice: 0 });
        }

        // Check if product already in cart
        const index = cart.products.findIndex(p => p.product.equals(productId));

        if (index > -1) {
            // Update quantity if exists
            cart.products[index].quantity += quantity;
        } else {
            // Add new product
            cart.products.push({ product: productId, quantity });
        }

        // Populate product details (price)
        await cart.populate('products.product');

        // Recalculate total price
        cart.totalPrice = cart.products.reduce((sum, item) => {
            const price = item.product?.price || 0;
            return sum + item.quantity * price;
        }, 0);

        await cart.save();

        res.json(cart);
    } catch (err) {
        console.error("Add to cart error:", err);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

// View cart
// GET /api/cart/view/:userId
router.get('/view/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ msg: 'Invalid userId' });
        }

        const cart = await Cart.findOne({ userId }).populate('products.product');
        if (!cart) return res.status(404).json({ msg: 'Cart not found' });

        res.json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Remove product from cart
// POST /api/cart/remove
router.post('/remove', async (req, res) => {
    try {
        const { userId, productId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ msg: 'Invalid userId or productId' });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ msg: 'Cart not found' });

        // Remove the product
        cart.products = cart.products.filter(item => item.product.toString() !== productId);

        // Recalculate total
        await cart.populate('products.product');
        cart.totalPrice = cart.products.reduce((total, item) => {
            return total + (item.quantity * (item.product?.price || 0));
        }, 0);

        await cart.save();

        res.json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Empty cart (Clear all items in the cart)
// POST /api/cart/clear
router.post('/clear', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ msg: 'Invalid userId' });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ msg: 'Cart not found' });

        // Clear the cart
        cart.products = [];
        cart.totalPrice = 0;

        await cart.save();

        res.json({ msg: 'Cart cleared successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
