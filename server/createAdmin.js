const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

const resetAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const email = "admin@foodbridge.com";
        const password = "FoodBridgeAdmin@2026";

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.findOneAndUpdate(
            { email },
            {
                name: "FoodBridge Admin",
                email,
                password: hashedPassword,
                role: "admin"
            },
            { upsert: true, new: true }
        );

        console.log("Admin account created or updated successfully!");
    } catch (error) {
        console.log("Error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
};

resetAdmin();