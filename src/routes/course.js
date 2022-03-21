
const express = require("express");
const courseSchema = require("../models/course")
const userSchema = require("../models/user")
const router = express.Router();

// create course
router.post('/courses', (req, res) => {
    const course = courseSchema(req.query);
    course.save()
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}))
});

// GET Courses {token}
router.get('/get_courses',  async (req, res, next) => {
    try {
            const userAuthentication = req.query;
            
            // Check if session_token is provided
            if (!userAuthentication.session_token) {
                res.status(401)
                next(new Error('session_token is required'))
            }
            console.log(userAuthentication.session_token);

            const userDb = await userSchema.findOne({token: userAuthentication.session_token}).exec();
            
            // Check if token in Mongo Database
            if (userDb == null) {
                res.status(401)
                next(new Error('No user with this token'))
            }
            
            console.log(userDb)
            console.log(userDb.id)

            // Date values
            const expirationTimeDb = new Date(userDb.expiration_time).getTime()
            const currentTime = new Date().getTime();

            // Check if session_token has expired
            if (expirationTimeDb < currentTime) {
                res.status(401)
                next(new Error('Token Authentication has expired'))
            }


            console.log("Token correct")

            // Courses from selected student
            const userCourses = await courseSchema.find({'subscribers.students': { $gte: userDb.id}}).select('title description subscribers.students').exec();
            console.log(userCourses)
            
            // Returns courses
            res.status(200).json(userCourses);
        
        }catch(e){
            console.log(e)
    }
});


// GET Courses {token}
router.get('/get_course_details',  async (req, res, next) => {
    try {
            const userCourseAuth = req.query;
            
            // Check if session_token is provided
            if (!userCourseAuth.session_token) {
                res.status(401)
                next(new Error('session_token is required'))
            }
            console.log(userCourseAuth.session_token);

            if (!userCourseAuth.courseID) {
                res.status(401)
                next(new Error('courseID is required'))
            }

            const userDb = await userSchema.findOne({token: userCourseAuth.session_token}).exec();
            
            // Check if token in Mongo Database
            if (userDb == null) {
                res.status(401)
                next(new Error('No user with this token'))
            }
            
            console.log(userDb)
            

            // Date values
            const expirationTimeDb = new Date(userDb.expiration_time).getTime()
            const currentTime = new Date().getTime();

            // Check if session_token has expired
            if (expirationTimeDb < currentTime) {
                res.status(401)
                next(new Error('Token Authentication has expired'))
            }


            console.log("Token correct")

            //Check if course id format is correct
            try {
                
                const userCourse = await courseSchema.findById( userCourseAuth.courseID).exec();
            }catch{
                res.status(401)
                next(new Error('Invalid id format'))
            }
            
            // Courses from selected student
            const userCourse = await courseSchema.findById( userCourseAuth.courseID).exec();
            
            //Check if course id exists
            if (!userCourse) {
                res.status(401)
                next(new Error('Invalid course id'))
            }
            else {

                console.log(userCourse.subscribers.students)
                console.log(userDb.id)
                let studentsSubscribers = userCourse.subscribers.students;

                let studentSubscriber =  studentsSubscribers.indexOf(userDb.id)
                console.log(studentSubscriber)

                if (studentSubscriber == -1) {
                    res.status(401)
                    next(new Error('not a student subscriber of this course'))
                }else{

                    res.status(200).json(userCourse);
                }
            }

            console.log(userCourse.subscribers.students)
            
            // Returns course
        
        }catch(e){
            console.log(e)
    }
});



// GET Courses {token}
router.get('/export_database',  async (req, res, next) => {
    try {

        const userLogin = req.query;
    
        // Check if username is provided
        if (!userLogin.username) {
            res.status(401)
            next(new Error('Username is required'))
        }
        console.log(userLogin.username);

        const userDb = await userSchema.findOne({username: userLogin.username}).exec();
        console.log(userDb)   
        console.log(userDb.username)
        
        // Check if username in Mongo Database
        if (userDb == null) {
            res.status(401)
            next(new Error('No user with this username'))
        }
        console.log("Username correct")

        // Check if password is correct
        if(userLogin.password == null || userLogin.password != userDb.password) {
            res.status(401)
            throw next( new Error('Wrong credentials'))
            
        }
        console.log("Password correct")

        // Courses
        const allCourses = await courseSchema.find().exec();
        console.log(allCourses)
        
        // Returns courses
        res.status(200).json(allCourses);
        
        }catch(e){
            console.log(e)
    }
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