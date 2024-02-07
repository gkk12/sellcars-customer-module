const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    company_name: {
        type: String,
        required: function () {
            return this.type === 'COMPANY' || this.type === 'DEALER'
        }
    },
    country: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    zip: {
        type: String,
        required: true
    },
    fax: {
        type: String,
        required: function () {
            return this.type === 'COMPANY' || this.type === 'DEALER'
        }
    },
    phone: {
        type: String,
        required: function () {
            return this.type === 'COMPANY' || this.type === 'DEALER'
        }
    },
    street: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: function () {
            return this.type === 'COMPANY' || this.type === 'DEALER'
        }
    }
});

module.exports = mongoose.model('Address', addressSchema)
