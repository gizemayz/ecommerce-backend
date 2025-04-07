const express = require('express');
const router = express.Router();
const Item = require('../models/Item'); 
const { verifyTokenExists, verifyAdmin } = require('../middlewares/authentication');
const User = require('../models/User');


router.get('/', async (req, res) => { // Get all items not logged in can see
    console.log("geting items");  
    const { category } = req.query;
    let filter = {};
    if (category) {
        filter.category = category;
    }
    const items = await Item.find(filter);
    res.json(items);
});

router.post("/add", verifyAdmin, async (req, res) => {
    //console.log("adding request sent");
    const { name, description, price, seller, image, category, batteryLife, age, size, material } = req.body;
    const newItem = new Item({
        name,
        description,
        price,
        seller,
        image,
        category,
        batteryLife: category === "GPS Sport Watches" ? batteryLife : undefined,
        age: category === "Antique Furniture" || category === "Vinyls" ? age : undefined,
        size: category === "Running Shoes" ? size : undefined,
        material: category === "Antique Furniture" || category === "Running Shoes" ? material : undefined,
    });//the rating and rewiews are not added here, no need to initialize here

    await newItem.save();
    res.status(201).json({ msg: "item added successfully", newItem });

});

router.delete("/remove/:id", verifyAdmin, async (req, res) => { //if the user's review list was important, then i should also delete the review from the user, dont use the user's reviews 
    const { id } = req.params;
    const username = req.user.username;
    await Item.findByIdAndDelete(id);
    // also need to delete the reviews and ratings of this item, already deleted in the schema
    res.status(200).json({ message: "item removed" });

});


router.post("/rate/:id", verifyTokenExists, async (req, res) => {
    const { id } = req.params;
    const { rating } = req.body;
    const username = req.user.username;
    const numericRating = Number(rating);
    const item = await Item.findById(id);
    const rated = item.ratings.get(String(username));

    if (!item) { // for convention, there will be items for this app ig
        return res.status(404).json({ message: "item not found" });
    }

    // initialize -> if this item does not have ratings yet
    if (!item.ratings) item.ratings = new Map(); 
    item.ratings.set(String(username), numericRating);
    await item.save();

    const user = await User.findOne({ username });
    /*if (user && !user.ratings.includes(id)) { //if user has rated, then add the itemid to the user's ratings
        user.ratings.push(id);
        await user.save();
    }*/
   //test with not rating and reviews in the user schema
    // another way is to keep the same structure as the ratings but now i dont need to 
    if (rated) {
        return res.status(400).json({ message: "Your rating is updated." });
    }
    res.status(200).json({ message: "Rating added", ratings: item.ratings });
   

});

router.post("/review/:id", verifyTokenExists, async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    const username = req.user.username;
    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    const alreadyReviewed = item.reviews.find(r => r.username === username);
    const user = await User.findOne({ username });

    /*if (user && !user.reviews.includes(id)) { //if user has reviewed, then add the itemid to the user's reiew list
        user.reviews.push(id);
        await user.save();
    }*/

    if (alreadyReviewed) {
        alreadyReviewed.text = text; // update the review
        await item.save();
        return res.status(400).json({ message: "Your review is updated." });
    }

    item.reviews.push({ username, text });
    await item.save();

    //else
    res.status(200).json({ message: "Review submitted" });

});

module.exports = router;
 //WHEN TAKING AVG RATING, IF NO REVİEW YOU DOES NOT ADD THAT RATE !!!! CHECK THAT