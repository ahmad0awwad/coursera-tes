const mongoose = require('mongoose');

// Define the product schema
const productSchema = new mongoose.Schema({
    _id: String, // Product ID
    name: String,
    name_arabic: String,
    Picture: String,
    "Item Code / SKU": String,
    Description_English: String,
    Description_Arabic: String,
    "Sell Price": String,
    "Gold Weight": String,
    "Diamond Weight": String,
    "Color Of Stone": String,
    "Dia Cut": String,
    "No Of Diamond": String,
    "item country": String,
});

// Define the subcategory schema
const subcategorySchema = new mongoose.Schema({
    _id: String, // Subcategory ID
    name: String,
    name_arabic: String,
    description: String,
    description_arabic: String,
    products: [productSchema], // Array of products
});

// Define the category schema
const categorySchema = new mongoose.Schema({
    _id: String, // Category ID
    name: String,
    name_arabic: String,
    description: String,
    description_arabic: String,
    subcategories: [subcategorySchema], // Array of subcategories
}, { timestamps: true }); // Add timestamps if needed

// Add methods or statics after defining the schema

// Add a method to add a subcategory
categorySchema.methods.addSubcategory = async function (subcategoryData) {
    this.subcategories.push(subcategoryData);
    return this.save();
};

// Add a method to find a subcategory by ID
categorySchema.methods.findSubcategory = function (subcategoryId) {
    return this.subcategories.id(subcategoryId);
};

// Register the Category model (avoid re-registering if it already exists)
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

module.exports = Category;
