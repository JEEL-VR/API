
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true

    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: false
    },

    expiration_time:{
        type: Date,
        required: false
    }

});

module.exports = mongoose.model('User', userSchema);