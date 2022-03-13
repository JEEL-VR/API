
const express = require("express");
const courseSchema = require("../models/course")
const router = express.Router();

// create course
router.post('/courses', (req, res) => {
    const course = courseSchema(req.body);
    course.save()
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}))
});


// delete course
router.delete('/courses/:id', (req, res) => {
    const {id} = req.params;
    courseSchema
    .remove({_id: id})
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}))
});


module.exports = router;