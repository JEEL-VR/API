
const express = require("express");

const userSchema = require("../models/user")

const router = express.Router();

// get all users
router.get('/users', (req, res) => {
    userSchema
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}))
});

module.exports = router;