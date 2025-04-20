const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises; // You might remove this later
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'YOUR_MONGODB_ATLAS_CONNECTION_STRING';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Define Mongoose Schemas and Models
const { Schema, model } = mongoose;

// Product Schema and Model (DEFINE ALL YOUR PRODUCT FIELDS HERE)
const productSchema = new Schema({
    productId: String,
    productDescription: String,
    productCategory: String,
    productUnit: String,
    productPrice: Number,
    productWeight: Number,
    productThumbnail: String
    // ... other product fields
});
const Product = model('Product', productSchema, 'products');

// Shopping Cart Item Schema and Model
const cartItemSchema = new Schema({ productId: { type: Schema.Types.ObjectId, ref: 'Product' }, quantity: Number /* ... */ });
const CartItem = model('CartItem', cartItemSchema, 'shoppingcart');

// Shipping Schema and Model
const shippingSchema = new Schema({ /* ... shipping fields ... */ });
const Shipping = model('Shipping', shippingSchema, 'shipping');

// Billing Schema and Model (map to your transaction data)
const billingSchema = new Schema({ /* ... billing/transaction fields ... */ });
const Billing = model('Billing', billingSchema, 'billing');

// Returns Schema and Model (map to your return data)
const returnSchema = new Schema({ /* ... return fields ... */ });
const Return = model('Return', returnSchema, 'returns');

// --- Product API Routes ---

// GET all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Failed to fetch products' });
    }
});

// POST a new product
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Failed to add product' });
    }
});

// PUT (update) an existing product by ID
app.put('/api/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Failed to update product' });
    }
});

// DELETE a product by ID
app.delete('/api/products/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Failed to delete product' });
    }
});

// --- Other API Routes (Returns, Transactions, etc.) ---

app.post('/api/returns', async (req, res) => {
    try {
        const returnData = req.body;
        const newReturn = new Return(returnData);
        await newReturn.save();
        console.log('Return data saved to MongoDB:', newReturn);
        res.status(201).json({ message: 'Return data saved successfully to MongoDB.' });
    } catch (error) {
        console.error('Error saving return data to MongoDB:', error);
        res.status(500).send('Error saving return data to the database.');
    }
});

app.post('/api/transactions', async (req, res) => {
    try {
        const transactionData = req.body;
        const newBilling = new Billing(transactionData);
        await newBilling.save();
        console.log('Billing data saved to MongoDB:', newBilling);
        res.status(201).json({ message: 'Billing data saved successfully to MongoDB.' });
    } catch (error) {
        console.error('Error saving billing data to MongoDB:', error);
        res.status(500).send('Error saving billing data to the database.');
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
