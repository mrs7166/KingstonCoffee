const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session'); // For session management

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// --- Session Management ---
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key', // Use environment variable for security
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true, maxAge: 24 * 60 * 60 * 1000 } // Secure in prod, HTTP only, 24hr max age
}));

// Middleware to get or create a cart ID for the session
app.use((req, res, next) => {
    if (!req.session.cartId) {
        req.session.cartId = generateUniqueId();
    }
    next();
});

function generateUniqueId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
// --- End Session Management ---

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
    // ... other product fields as needed
});
const Product = model('Product', productSchema, 'products');

// Shopping Cart Item Schema and Model
const cartItemSchema = new Schema({
    sessionId: String,
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    name: String,
    price: Number,
    productThumbnail: String
});
const CartItem = model('CartItem', cartItemSchema, 'cart');

// Returns Schema and Model
const returnSchema = new Schema({ /* ... return fields ... */ });
const Return = model('Return', returnSchema, 'returns');

// Billing Schema and Model
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

// GET cart for the current session
app.get('/api/cart', async (req, res) => {
    const sessionId = req.session.cartId;
    try {
        const cartItems = await CartItem.find({ sessionId: sessionId });
        res.json(cartItems);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Failed to fetch cart' });
    }
});

// POST add item to cart
app.post('/api/cart/add', async (req, res) => {
    const sessionId = req.session.cartId;
    const { productId, quantity = 1 } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const existingItem = await CartItem.findOne({ sessionId: sessionId, productId: productId });

        if (existingItem) {
            existingItem.quantity += quantity;
            await existingItem.save();
        } else {
            const newItem = new CartItem({
                sessionId: sessionId,
                productId: productId,
                quantity: quantity,
                name: product.productDescription,
                price: product.productPrice,
                productThumbnail: product.productThumbnail
            });
            await newItem.save();
        }

        const updatedCart = await CartItem.find({ sessionId: sessionId });
        res.json(updatedCart);

    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Failed to add to cart' });
    }
});

// POST update cart item quantity
app.post('/api/cart/update', async (req, res) => {
    const sessionId = req.session.cartId;
    const { productId, quantity } = req.body;

    try {
        const updatedItem = await CartItem.findOneAndUpdate(
            { sessionId: sessionId, productId: productId },
            { quantity: quantity },
            { new: true }
        );

        if (updatedItem) {
            const updatedCart = await CartItem.find({ sessionId: sessionId });
            res.json(updatedCart);
        } else {
            res.status(404).json({ message: 'Cart item not found' });
        }
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ message: 'Failed to update cart item' });
    }
});

// POST remove cart item
app.post('/api/cart/remove', async (req, res) => {
    const sessionId = req.session.cartId;
    const { productId } = req.body;

    try {
        await CartItem.findOneAndDelete({ sessionId: sessionId, productId: productId });
        const updatedCart = await CartItem.find({ sessionId: sessionId });
        res.json(updatedCart);
    } catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).json({ message: 'Failed to remove cart item' });
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