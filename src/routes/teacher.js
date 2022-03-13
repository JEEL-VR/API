
const express = require("express");
const teacherSchema = require("../models/teacher")
const router = express.Router();

// create teacher
router.post('/teachers', (req, res) => {
    const teacher = teacherSchema(req.body);
    teacher.save()
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}))
});

// get all teachers
router.get('/teachers', (req, res) => {
    teacherSchema
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}))
});

// get teacher
router.get('/teachers/:id', (req, res) => {
    const {id} = req.params;
    teacherSchema
    .findById(id)
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}))
});

// update teacher
router.put('/teachers/:id', (req, res) => {
    const {id} = req.params;
    const { name, age, email} = req.body;
    teacherSchema
    .updateOne({_id: id}, { $set: { name, age, email}})
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}))
});

// delete teacher
router.delete('/teachers/:id', (req, res) => {
    const {id} = req.params;
    teacherSchema
    .remove({_id: id})
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}))
});


module.exports = router;