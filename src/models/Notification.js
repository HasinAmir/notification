const mongoose = require('momgoose');

const notifySchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true
    },
    message: {
        type: Object,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }

}, { timestamps: true });

module.exports = mongoose.model('Notification', notifySchema)