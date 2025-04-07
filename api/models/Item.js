const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  seller: String,
  image: {
    type: String,
    required: true,
    default: "https://paymentcloudinc.com/blog/wp-content/uploads/2021/08/product-ideas-to-sell.jpg"
  },
  batteryLife: String,  // GPS Sport Watches
  age: String,          // Antique Furniture and Vinyls
  size: String,         // Running Shoes
  material: String,     // Antique furniture and running shoes
  category: {
    type: String,
    enum: ['GPS Sport Watches', 'Antique Furniture', 'Vinyls', 'Running Shoes'],
  },
  reviews: [
    {
      username: String,
      text: String,
      date: { type: Date, default: Date.now }
    }
  ],
  ratings: { //key:value, string:number
    // "user1": 5, "user2": 4
    type: Map,
    of: Number,
    default: {},
  },
});

const Item = mongoose.model('Item', ItemSchema);
module.exports = Item;
