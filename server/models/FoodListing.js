
const mongoose = require("mongoose");

const foodListingSchema = new mongoose.Schema({
    foodName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        enum: ["Vegetarian", "Non-Vegetarian", "Vegan", "Bakery", "Other"],
        required: true
    },
    pickupLocation: {
        type: String,
        required: true
    },
    preparedAt: {
        type: Date,
        required: true
    },
    pickupDeadline: {
        type: Date,
        required: true
    },
    storageInstructions: {
        type: String
    },
    allergens: {
        type: [String],
        default: []
    },
    status: {
        type: String,
        enum: ["Available", "Claimed", "Completed", "Expired"],
        default: "Available"
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    claimedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model("FoodListing", foodListingSchema);
