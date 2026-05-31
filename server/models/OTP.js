const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true
    },

    otp: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: [
            "signup",
            "forgot-password"
        ],
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600
    }

});

module.exports = mongoose.model("OTP", otpSchema);