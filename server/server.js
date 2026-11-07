
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodRoutes");
const claimRoutes = require("./routes/claimRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/admin", adminRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected Successfully!"))
    .catch((error) => console.log("MongoDB Connection Error:", error));

app.get("/", (req, res) => {
    res.send("Welcome to FoodBridge API!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`FoodBridge server running on port ${PORT}`);
});
