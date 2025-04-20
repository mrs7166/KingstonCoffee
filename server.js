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

// Product Schema and Model
const productSchema = new Schema({ name: String, description: String, price: Number /* ... other fields */ });
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

// --- Modified/New API Routes ---

// Route to handle saving return information to MongoDB
app.post('/api/returns', async (req, res) => {
  try {
    const returnData = req.body;
    const newReturn = new Return(returnData); // Create a new Return document
    await newReturn.save(); // Save it to the 'returns' collection in MongoDB
    console.log('Return data saved to MongoDB:', newReturn);
    res.status(201).json({ message: 'Return data saved successfully to MongoDB.' });
  } catch (error) {
    console.error('Error saving return data to MongoDB:', error);
    res.status(500).send('Error saving return data to the database.');
  }
});

// Route to handle saving billing information to MongoDB
app.post('/api/transactions', async (req, res) => {
  try {
    const transactionData = req.body;
    const newBilling = new Billing(transactionData); // Create a new Billing document
    await newBilling.save(); // Save it to the 'billing' collection in MongoDB
    console.log('Billing data saved to MongoDB:', newBilling);
    res.status(201).json({ message: 'Billing data saved successfully to MongoDB.' });
  } catch (error) {
    console.error('Error saving billing data to MongoDB:', error);
    res.status(500).send('Error saving billing data to the database.');
  }
});

// Example route to get products from MongoDB
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// ... Add other API routes for shopping cart, shipping, etc.

// --- Remove or modify the file-based routes ---
// You can either remove these completely once you're fully on MongoDB
// or keep them temporarily for a transition period.
// Note the change in the endpoint for saving returns to '/api/returns' (more RESTful).
// The frontend will need to be updated to reflect these new endpoints.
/*
app.post('/returns/returns.json', async (req, res) => { ... });
app.post('/api/transactions', async (req, res) => { ... });
*/

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});