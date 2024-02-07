const mongoose = require('mongoose')
const addressSchema = require('./address')

const contactPersonSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile_phone: {
        type: String,
        required: true
    },
    birth_date: {
        type: String,
        required: true
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    }
});

module.exports = mongoose.model('ContactPerson', contactPersonSchema)