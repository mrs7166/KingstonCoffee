const express = require('express');
const bodyParser = require('body-parser');
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

// Product Schema and Model
const productSchema = new Schema({
    productId: String,
    productDescription: String,
    productCategory: String,
    productUnit: String,
    productPrice: Number,
    productWeight: Number,
    productThumbnail: String
});
const Product = model('Product', productSchema, 'products');

// Shopping Cart Item Schema and Model (Removed sessionId)
const cartItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    name: String,
    price: Number,
    productThumbnail: String
});
const CartItem = model('CartItem', cartItemSchema, 'cart');

// Billing Information Schema and Model (For billing address)
const billingInfoSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    address2: String,
    country: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const BillingInfo = model('BillingInfo', billingInfoSchema, 'billing_info');

// Returns Schema and Model
const returnSchema = new Schema({ /* ... return fields ... */ });
const Return = model('Return', returnSchema, 'returns');

// Billing Schema and Model (For final transactions - you might use this later)
const billingSchema = new Schema({ /* ... billing/transaction fields ... */ });
const Billing = model('Billing', billingSchema, 'billing');

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

// --- Shopping Cart API Routes ---

// GET cart (now gets all items)
app.get('/api/cart', async (req, res) => {
    try {
        const cartItems = await CartItem.find();
        res.json(cartItems);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Failed to fetch cart' });
    }
});

// POST add item to cart (no sessionId needed)
app.post('/api/cart/add', async (req, res) => {
    const { productId, quantity = 1 } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const existingItem = await CartItem.findOne({ productId: productId });

        if (existingItem) {
            existingItem.quantity += quantity;
            await existingItem.save();
        } else {
            const newItem = new CartItem({
                productId: productId,
                quantity: quantity,
                name: product.productDescription,
                price: product.productPrice,
                productThumbnail: product.productThumbnail
            });
            await newItem.save();
        }

        const updatedCart = await CartItem.find();
        res.json(updatedCart);

    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Failed to add to cart' });
    }
});

// POST update cart item quantity (no sessionId needed)
app.post('/api/cart/update', async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        const updatedItem = await CartItem.findOneAndUpdate(
            { productId: productId },
            { quantity: quantity },
            { new: true }
        );

        if (updatedItem) {
            const updatedCart = await CartItem.find();
            res.json(updatedCart);
        } else {
            res.status(404).json({ message: 'Cart item not found' });
        }
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ message: 'Failed to update cart item' });
    }
});

// POST remove cart item (no sessionId needed)
app.post('/api/cart/remove', async (req, res) => {
    const { productId } = req.body;

    try {
        await CartItem.findOneAndDelete({ productId: productId });
        const updatedCart = await CartItem.find();
        res.json(updatedCart);
    } catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).json({ message: 'Failed to remove cart item' });
    }
});

// --- Billing Information API Route ---
app.post('/api/billing-info', async (req, res) => {
    try {
        const billingData = new BillingInfo(req.body);
        const savedBillingInfo = await billingData.save();
        console.log('Billing information saved:', savedBillingInfo);
        res.status(201).json({ message: 'Billing information saved successfully', data: savedBillingInfo });
    } catch (error) {
        console.error('Error saving billing information:', error);
        res.status(500).json({ message: 'Failed to save billing information', error: error.errors });
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