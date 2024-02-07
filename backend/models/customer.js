const mongoose = require('mongoose')
const contactPersonSchema = require('./contactPerson')
const addressSchema = require('./address')

const customerSchema = new mongoose.Schema({
    intnr: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
        enum: ['PRIVATE', 'COMPANY', 'DEALER']
    },
    contact_persons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ContactPerson',
        validate: {
            validator: function () {
                return this.type !== 'PRIVATE' || this.contact_persons.length <= 1
            },
            message: 'Private customers should have at most one contact person.'
        }
    }],
    addresses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    }],
    created_at: {
        type: Date,
        required: true,
        default: Date.now
    },
    updated_at: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = mongoose.model('Customer', customerSchema);
