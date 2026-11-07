
const express = require("express");
const FoodListing = require("../models/FoodListing");
const jwt = require("jsonwebtoken");

const router = express.Router();

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. Login required." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

router.post("/", verifyToken, async (req, res) => {
    try {
        if (req.user.role !== "restaurant") {
            return res.status(403).json({ message: "Only restaurants can add food listings" });
        }

        const food = await FoodListing.create({
            ...req.body,
            postedBy: req.user.id
        });

        res.status(201).json({
            message: "Food listing created successfully",
            food
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const foods = await FoodListing.find()
            .populate("postedBy", "name email")
            .sort({ createdAt: -1 });

        res.json(foods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const food = await FoodListing.findById(req.params.id)
            .populate("postedBy", "name email");

        if (!food) {
            return res.status(404).json({ message: "Food listing not found" });
        }

        res.json(food);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put("/:id", verifyToken, async (req, res) => {
    try {
        const food = await FoodListing.findById(req.params.id);

        if (!food) {
            return res.status(404).json({ message: "Food listing not found" });
        }

        if (food.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "You cannot update this listing" });
        }

        const allowedFields = [
            "foodName", "description", "quantity", "category",
            "pickupLocation", "preparedAt", "pickupDeadline",
            "storageInstructions", "allergens"
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                food[field] = req.body[field];
            }
        });

        await food.save();

        res.json({
            message: "Food listing updated successfully",
            food
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const food = await FoodListing.findById(req.params.id);

        if (!food) {
            return res.status(404).json({ message: "Food listing not found" });
        }

        if (food.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "You cannot delete this listing" });
        }

        await food.deleteOne();

        res.json({ message: "Food listing deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
