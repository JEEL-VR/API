const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user')


// environment variables
require('dotenv').config();
const app = express();
const port = process.env.PORT || 9000;

// routes
app.get("/", (req, res) =>{
    res.send('Welcome to my API');
});

// middleware
app.use(express.json())
app.use('/api', userRoutes);

// mongodb connection
mongoose.connect(process.env.DATABASE_URL)
.then(console.log('Connected to MongoDB Atlas'))
.catch((error) => console.error(error));



app.listen(port, () => console.log('server listening on port', port));
