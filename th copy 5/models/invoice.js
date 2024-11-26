const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    shippingMethod: String,
    pickupDetails: {
        firstName: String,
        lastName: String,
        phone: String,
        email: String,
        civilId: String
    },
    deliveryDetails: {
        firstName: String,
        lastName: String,
        phone: String,
        email: String,
        civilId: String,
        area: String,
        block: String,
        street: String,
        house: String,
        floor: String,
        flat: String,
        civilIdImages: [String] // Add this line

    },
    paymentMethod: String,
    cart: Array,
    createdAt: { type: Date, default: Date.now }
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
