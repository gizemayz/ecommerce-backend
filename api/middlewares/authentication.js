const jwt = require("jsonwebtoken");

const verifyTokenExists = (req, res, next) => { 
    const token = req.header("Authorization");
    if (!token) return res.status(403).json({ msg: "access denied" });
    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ msg: "invalid token?" });
    }
};

const verifyAdmin = (req, res, next) => {
    verifyTokenExists(req, res, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            res.status(403).json({ msg: "You are not an admin, it is only for admins!!" });
        }
    });
};

const verifyUser = (req, res, next) => {
    verifyTokenExists(req, res, () => {
        if (!req.user.isAdmin) {
            next();
        } else {
            res.status(403).json({ msg: "You are not an user login pls :)" });
        }
    });
};

module.exports = { verifyTokenExists, verifyAdmin, verifyUser };
