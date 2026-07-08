const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// Import our database models
const Product = require('./models/Product');
const StorePrice = require('./models/StorePrice');

require('dotenv').config({ path: './.env' }); 

const app = express();
app.use(express.json()); 

// Basic Health Route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: "Success",
    message: "Welcome to the PriceMatch API!" 
  });
});

// --- NEW: SEED DATABASE ROUTE ---
app.get('/api/seed', async (req, res) => {
  try {
    // Clear out existing data so we don't duplicate on refreshes
    await Product.deleteMany({});
    await StorePrice.deleteMany({});

    // 1. Create Sample Master Products
    const milk = await Product.create({ name: "Whole Milk 1L", category: "Dairy" });
    const bread = await Product.create({ name: "White Sliced Bread", category: "Bakery" });
    const eggs = await Product.create({ name: "Large Eggs 12pk", category: "Dairy" });

    // 2. Create Sample Prices across different local stores
    await StorePrice.create([
      // Milk prices
      { productId: milk._id, storeName: "SuperMart", price: 2.49 },
      { productId: milk._id, storeName: "FreshGrocer", price: 2.19 },
      { productId: milk._id, storeName: "QuickStop", price: 2.99 },

      // Bread prices
      { productId: bread._id, storeName: "SuperMart", price: 1.89 },
      { productId: bread._id, storeName: "FreshGrocer", price: 1.99 },
      { productId: bread._id, storeName: "QuickStop", price: 2.49 },

      // Eggs prices
      { productId: eggs._id, storeName: "SuperMart", price: 3.49 },
      { productId: eggs._id, storeName: "FreshGrocer", price: 3.29 },
      { productId: eggs._id, storeName: "QuickStop", price: 3.99 }
    ]);

    res.json({ status: "Success", message: "Database seeded successfully with products and prices!" });
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
});
// --------------------------------
// --- NEW: PRICE COMPARISON SEARCH ROUTE ---
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query; // Get the search query from the URL (e.g., /api/search?q=Milk)

    if (!q) {
      return res.status(400).json({ status: "Error", message: "Please provide a search term using ?q=" });
    }

    // 1. Find all products that match the search term (case-insensitive)
    const products = await Product.find({
      name: { $regex: q, $options: 'i' }
    });

    if (products.length === 0) {
      return res.json({ status: "Success", message: "No matching products found.", results: [] });
    }

    // Extract all matching product IDs
    const productIds = products.map(p => p._id);

    // 2. Find all store prices for those products and sort them cheapest first
    const prices = await StorePrice.find({ productId: { $in: productIds } })
      .populate('productId', 'name category') // Merges product details into the price object
      .sort({ price: 1 }); // 1 means ascending order (cheapest first)

    res.json({
      status: "Success",
      count: prices.length,
      results: prices
    });

  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
});
// ------------------------------------------
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('🔌 Connected to MongoDB successfully!');
    app.listen(PORT, () => {
      console.log(`🚀 PriceMatch server is blasting off on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
  });