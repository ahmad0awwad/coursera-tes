const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
    name: String
});

const Area = mongoose.model('Area', areaSchema);

module.exports = Area;
