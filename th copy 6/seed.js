const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Area = require('./models/area');
const Slider = require('./models/slider');
const Category = require('./models/category');

mongoose.connect('mongodb://admin:1234@127.0.0.1:27017/invoices?authSource=admin', {
    serverSelectionTimeoutMS: 5000,
    heartbeatFrequencyMS: 1000
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.error('MongoDB connection error:', err));

const seedData = async () => {
    try {
        const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'mockDb.json'), 'utf8'));

        await Area.insertMany(data.areas.map(area => ({ name: area })));
        await Slider.insertMany(data.slider);
        
        for (const category of data.categories) {
            const newCategory = new Category({
                name: category.name,
                subcategories: category.subcategories
            });
            await newCategory.save();
        }

        console.log('Data seeded successfully');
        mongoose.disconnect();
    } catch (error) {
        console.error('Error seeding data:', error);
        mongoose.disconnect();
    }
};

seedData();
