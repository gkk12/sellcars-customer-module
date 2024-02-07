const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10

const userSchema = new mongoose.Schema({
    first_name: {
        type: String, // max 50 chars
        required: true
    },
    last_name: {
        type: String, // max 50 chars
        required: true
    },
    password_hash: {
        type: String, // max 50 chars
        required: true
    },
    email: {
        type: String, // max 75 chars
        required: true
    },
    created_at: {
        type: Date, // ISO Date
        required: true,
        default: Date.now
    },
    updated_at: {
        type: Date,  // ISO Date
        required: true,
        default: Date.now
    }
})

userSchema.pre('save', async function (next) {
    try {
        const hashedPassword = await bcrypt.hash(this.password_hash, saltRounds)
        this.password_hash = hashedPassword
        next()
    } catch (err) {
        next(err)
    }
});

module.exports = mongoose.model('User', userSchema)