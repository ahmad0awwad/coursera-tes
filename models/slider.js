const mongoose = require('mongoose');

const sliderSchema = new mongoose.Schema({
    image: String,
    title: String,
    collection: String,
    link: String
});

const Slider = mongoose.model('Slider', sliderSchema);

module.exports = Slider;
