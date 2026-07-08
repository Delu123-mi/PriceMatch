const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },       // e.g., "White Bread"
  category: { type: String, required: true },   // e.g., "Bakery"
  imageUrl: { type: String }                    // Placeholder for product images in our Flutter app
});

module.exports = mongoose.model('Product', ProductSchema);