const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    amount: {
        type: Number,
        required: true
    },

    category: {
        type: String,
        required: true,
        enum: [
            "Food & Dining",
            "Transport",
            "Shopping",
            "Entertainment",
            "Bills & Utilities",
            "Housing",
            "Education",
            "Health",
            "Travel"
        ]
    },

    description: {
        type: String,
        required: true
    },

    transactionDate: {
        type: Date,
        required: true
    },

    paymentMethod: {
        type: String,
        required: true,
        enum: [
            "UPI",
            "CARD",
            "CASH",
            "NET_BANKING"
        ]
    },

    notes: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        enum: [
            "completed",
            "pending",
            "failed"
        ],
        default: "completed"
    }

}, { timestamps: true });

module.exports = mongoose.model(
    "Transaction",
    transactionSchema
);