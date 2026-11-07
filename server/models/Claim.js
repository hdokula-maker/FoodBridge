
const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema({
    foodListing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoodListing",
        required: true
    },
    claimedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    claimStatus: {
        type: String,
        enum: ["Pending", "Approved", "Completed", "Cancelled"],
        default: "Pending"
    },
    claimedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model("Claim", claimSchema);
