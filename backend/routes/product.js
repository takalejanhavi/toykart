const express = require('express');
const Product = require('../models/product');
const router = express.Router();

// Route to create a new product
router.post('/', async (req, res) => {
    const { name, description, price, imageUrl, category, stock } = req.body;

    try {
        const newProduct = new Product({ name, description, price, imageUrl, category, stock });
        await newProduct.save();
        res.status(201).json({ message: 'Product created successfully!', product: newProduct });
    } catch (err) {
        res.status(500).json({ message: 'Error creating product', error: err.message });
    }
});

// Route to get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products', error: err.message });
    }
});

// Route to get a single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching product', error: err.message });
    }
});

module.exports = router;
