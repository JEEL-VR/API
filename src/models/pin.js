
const mongoose = require("mongoose");

const pinSchema = mongoose.Schema({

    pin: {
        type: Number,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    vr_task_id: {
        type: Number,
        required: true
    },
    vr_exercise_id: {
        type: Number,
        required: true
    },
    createdAt: { 
        type: Date,
        expires: "1d", 
        default: Date.now
    }
});


module.exports = mongoose.model('Pin', pinSchema);