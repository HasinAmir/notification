const mongoose = require('mongoose');

const notifySchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }


}, { timestamps: true });

module.exports = mongoose.model('Notification', notifySchema)