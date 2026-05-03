const mongoose = require('mongoose');

const subSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now()
    }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subSchema)