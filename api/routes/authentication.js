const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
    const { username, password, isAdmin } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, isAdmin: isAdmin  ||false });
        await user.save();
        res.json({ msg: "register works" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ msg: "user not found" });
        const matched = await bcrypt.compare(password, user.password);
        if (!matched) return res.status(400).json({ msg: "invalid credentials" });

        const token = jwt.sign({ id: user._id, username: user.username, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token, isAdmin: user.isAdmin });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("hi i am error, from login");
    }
});

module.exports = router;
