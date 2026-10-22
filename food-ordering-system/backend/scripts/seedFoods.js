// Run with:  npm run seed   (inside the backend folder)
// Adds sample foods. Running it again will NOT create duplicates (matched by name).
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../database');
const Food = require('../models/Food');

const sampleFoods = [
  { name: 'Chicken Biryani', description: 'Basmati rice cooked with spiced chicken and herbs.', category: 'Biryani', price: 220, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500' },
  { name: 'Veg Biryani', description: 'Fragrant rice with mixed vegetables and mild spices.', category: 'Biryani', price: 160, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500' },
  { name: 'Margherita Pizza', description: 'Classic pizza with tomato sauce and mozzarella cheese.', category: 'Pizza', price: 199, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500' },
  { name: 'Chicken Burger', description: 'Crispy chicken patty with lettuce and creamy sauce.', category: 'Burgers', price: 129, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
  { name: 'French Fries', description: 'Golden fries with salt, served hot.', category: 'Snacks', price: 79, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500' },
  { name: 'Sandwich', description: 'Grilled sandwich with vegetables and cheese.', category: 'Snacks', price: 99, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500' },
  { name: 'Soft Drink', description: 'Chilled cola, 300 ml.', category: 'Drinks', price: 40, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500' }
];

async function seed() {
  await connectDB();
  let added = 0;
  for (const food of sampleFoods) {
    // only inserts if no food with this name exists yet
    const result = await Food.updateOne(
      { name: food.name },
      { $setOnInsert: { ...food, available: true, createdAt: new Date() } },
      { upsert: true }
    );
    if (result.upsertedCount > 0) added++;
  }
  console.log(`Done. ${added} new food item(s) added, ${sampleFoods.length - added} already existed.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
