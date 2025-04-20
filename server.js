const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const mongoURI = process.env.MONGODB_URI || 'YOUR_MONGODB_ATLAS_CONNECTION_STRING';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

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

// Shipping Information Schema and Model
const shippingInfoSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    address2: String,
    country: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    sameAddress: Boolean,
    selectedShippingCost: Number,
    paymentMethod: String, // You might want a more detailed payment schema later
    ccName: String,
    ccNumber: String,
    ccExpiration: String,
    ccCvv: String,
    cartItems: [cartItemSchema], // Embed the cart items
    shippingAmount: Number,
    totalAmount: Number,
    createdAt: { type: Date, default: Date.now }
});
const ShippingInfo = model('ShippingInfo', shippingInfoSchema, 'shipping_info'); // Use a different collection name

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

// --- Checkout API Route for Shipping Information ---
app.post('/api/checkout/shipping', async (req, res) => {
    try {
        const shippingData = new ShippingInfo(req.body);
        const savedShippingInfo = await shippingData.save();
        console.log('Shipping information saved:', savedShippingInfo);
        res.status(201).json({ message: 'Shipping information saved successfully', data: savedShippingInfo });
    } catch (error) {
        console.error('Error saving shipping information:', error);
        res.status(500).json({ message: 'Failed to save shipping information', error: error.errors });
    }
});

// --- Other API Routes (Returns, Transactions, etc.) ---

// --- Return Submission API Route ---
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs
app.post('/api/returns/submit', async (req, res) => {
    try {
        const returnItems = req.body.items;

        if (!returnItems || !Array.isArray(returnItems) || returnItems.length === 0) {
            return res.status(400).json({ message: 'No items provided for return.' });
        }

        const returnId = uuidv4(); // Generate a unique return ID on the server

        const newReturn = new Return({
            returnId: returnId,
            submissionDate: new Date(),
            items: returnItems.map(item => ({
                productId: item.productId,
                productDescription: item.productDescription,
                price: item.price,
                imageUrl: item.imageUrl,
                reason: item.reason,
                condition: item.condition,
                returnDetails: item.returnDetails
            })),
            // You might want to associate this return with a user later
        });

        const savedReturn = await newReturn.save();
        console.log('Return data saved:', savedReturn);
        res.status(201).json({ message: 'Return request submitted successfully', returnId: returnId, data: savedReturn });
    } catch (error) {
        console.error('Error saving return data:', error);
        res.status(500).json({ message: 'Failed to submit return request', error: error.errors });
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