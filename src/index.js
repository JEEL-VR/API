
const express = require('express');
const mongoose = require('mongoose');
const studentRoutes = require('./routes/student')
const teacherRoutes = require('./routes/teacher')
const courseRoutes = require('./routes/course')
const userRoutes = require('./routes/users')

// environment variables
require('dotenv').config();
const app = express();
const port = process.env.PORT || 9000;

// routes
app.get("/", (req, res) =>{
    res.send('<h2>Welcome to ClassVRroom API!</h2><br><p>For more information please visit this <a href="https://github.com/JEEL-VR/API">Github</a> repository.</p>');
});

// Heroku/Cordova Headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
  });

// middleware
app.use(express.json())
app.use('/api', studentRoutes, teacherRoutes, courseRoutes, userRoutes);


// mongodb connection
mongoose.connect(process.env.DATABASE_URL)
.then(console.log('Connected to MongoDB Atlas'))
.catch((error) => console.error(error));

// Port established
app.listen(port, () => console.log('server listening on port', port));
