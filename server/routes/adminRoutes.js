
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const FoodListing = require("../models/FoodListing");
const Claim = require("../models/Claim");

const router = express.Router();

const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Login required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "admin") {
            return res.status(403).json({
                message: "Admin access only"
            });
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

router.get("/stats", verifyAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalDonations = await FoodListing.countDocuments();
        const availableDonations = await FoodListing.countDocuments({
            status: "Available"
        });
        const claimedDonations = await FoodListing.countDocuments({
            status: "Claimed"
        });
        const totalClaims = await Claim.countDocuments();

        res.json({
            totalUsers,
            totalDonations,
            availableDonations,
            claimedDonations,
            totalClaims
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/users", verifyAdmin, async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/foods", verifyAdmin, async (req, res) => {
    try {
        const foods = await FoodListing.find()
            .populate("postedBy", "name email")
            .populate("claimedBy", "name email");

        res.json(foods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete("/foods/:id", verifyAdmin, async (req, res) => {
    try {
        const food = await FoodListing.findByIdAndDelete(req.params.id);

        if (!food) {
            return res.status(404).json({
                message: "Food listing not found"
            });
        }

        await Claim.deleteMany({ foodListing: food._id });

        res.json({
            message: "Food listing deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
