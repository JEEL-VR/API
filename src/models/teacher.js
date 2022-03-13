
const mongoose = require("mongoose");

const teacherSchema = mongoose.Schema({
    name: {
        type: String,
        required: true

    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Teacher', teacherSchema);