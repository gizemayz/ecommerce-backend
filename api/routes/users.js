const express = require("express");
const { verifyTokenExists, verifyAdmin, verifyUser } = require("../middlewares/authentication");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require("bcryptjs"); 
const Item = require("../models/Item");
router.get("/", async (req, res) => {
    const users = await User.find();
    res.status(200).json(users);
    
});

router.post("/adduser", verifyAdmin, async (req, res, next) => {
  const { username, password, isAdmin } = req.body;
  const registeredUser = await User.findOne({ username });
  if (registeredUser) {
      return res.status(400).json({ message: "this username already exists, pls find a new one" });
  }
  const hashKey = await bcrypt.hash(password, 10);
  const newUser = new User({
      username,
      password: hashKey,
      isAdmin: false,
  });
  await newUser.save();
  res.status(201).json({ message: "user added", user: newUser });
 
});

router.delete("/removeuser/:id", verifyAdmin, async (req, res) => {
    const { id } = req.params;
      const removeUser = await User.findById(id);

      if (!removeUser) {
          return res.status(404).json({ message: "User not found" });
      }

      const username = removeUser.username;

      await User.findByIdAndDelete(id);
      await Item.updateMany(
          {},
          { $pull: { reviews: { username: username } } }
      );

      await Item.updateMany(
          {},
          { $unset: { [`ratings.${username}`]: "" } }
      );
  
  
});

/*

router.delete("/removeuser/:id", verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({ message: "user not found" });
    }
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "user removed successfully" });
    
});*/


router.get("/profile", verifyUser, async (req, res) => {
        const username = req.user.username;
        //fetch items from users ratings and reviews

       const items = await Item.find({
            $or: [
                { "reviews.username": username },
                { [`ratings.${username}`]: { $exists: true } }
            ]
        });

        let ratingSum = 0;
        let ratingCount = 0;
        let userReviews = [];
        for (const item of items) {
            const currReviews = item.reviews.filter(r => r.username === username);
            for (const r of currReviews) {
              userReviews.push({
                itemName: item.name,
                text: r.text,
                rating: item.ratings.get(username) || null, 
              });
            }
        const userRating = item.ratings.get(username);
        if (typeof userRating === "number") {
          ratingSum += userRating;
          ratingCount++;
        }
      
    }
      const avgRate = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(2) : null;

      const response = {
        username,
        avgRate,
        reviews: userReviews,
      };
      res.json(response);
});

module.exports = router;
