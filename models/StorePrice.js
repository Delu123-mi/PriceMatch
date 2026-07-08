const mongoose = require('mongoose');

const StorePriceSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', // This links the price directly to our master product above
    required: true 
  },
  storeName: { type: String, required: true },   // e.g., "Shoppers Mart", "Fresh Grocer"
  price: { type: Number, required: true }        // e.g., 2.99
});

// This complex index stops us from accidentally creating duplicate prices for the same product at the same store
StorePriceSchema.index({ productId: 1, storeName: 1 }, { unique: true });

module.exports = mongoose.model('StorePrice', StorePriceSchema);