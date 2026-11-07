
const express = require("express");
const jwt = require("jsonwebtoken");
const FoodListing = require("../models/FoodListing");
const Claim = require("../models/Claim");

const router = express.Router();

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Login required" });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

router.post("/:foodId", verifyToken, async (req, res) => {
    try {
        if (!["ngo", "volunteer"].includes(req.user.role)) {
            return res.status(403).json({
                message: "Only NGOs and volunteers can claim food"
            });
        }

        const food = await FoodListing.findById(req.params.foodId);

        if (!food) {
            return res.status(404).json({ message: "Food listing not found" });
        }

        if (food.status !== "Available") {
            return res.status(400).json({ message: "Food is not available" });
        }

        food.status = "Claimed";
        food.claimedBy = req.user.id;
        await food.save();

        const claim = await Claim.create({
            foodListing: food._id,
            claimedBy: req.user.id,
            claimStatus: "Approved"
        });

        res.status(201).json({
            message: "Food claimed successfully",
            claim
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/my-claims", verifyToken, async (req, res) => {
    try {
        const claims = await Claim.find({ claimedBy: req.user.id })
            .populate("foodListing");

        res.json(claims);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
