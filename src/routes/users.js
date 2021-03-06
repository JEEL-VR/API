
const express = require("express");
const userSchema = require("../models/user")

const router = express.Router();

// Login { username, password }
router.get('/login',  async (req, res, next) => {
    
    try {
        const userLogin = req.query;
    
        // Check if username is provided
        if (!userLogin.username) {
            res.status(401).send({error : 'Username is required'});
            return next(new Error('Username is required'))
        }
        console.log(userLogin.username);

        const userDb = await userSchema.findOne({username: userLogin.username}).exec();
        
        
        // Check if username in Mongo Database
        if (userDb == null) {
            res.status(401).send({error : 'No user with that username'});
            return next(new Error('No user with that username'))
        }
        console.log("Username correct")
        

        // Check if password is correct
        if(userLogin.password == null || userLogin.password != userDb.password) {
            res.status(401).send({error : 'Wrong credentials'});
            return next( new Error('Wrong credentials'))
            
        }
        console.log("Password correct")


        // Date values
        const expirationTimeDb = new Date(userDb.expiration_time).getTime()
        const currentTime = new Date().getTime();
        
        // TODO: Check if the user has token in Mongo Database and expiration_time
        if(!userDb.token || !userDb.expiration_time || expirationTimeDb < currentTime) {
            
            // creates new token
            const rand = () => {
                return Math.random().toString(36).substr(2);
            };
            
            const token = () => {
                return rand() + rand();
            }

            // creates new expiration_time
            var currentDateObj = new Date();
            var numberOfMlSeconds = currentDateObj.getTime();
            var addMlSeconds = 60 * 60 * process.env.TOKEN_EXPIRATION_TIME;
            var newDateObj = new Date(numberOfMlSeconds + addMlSeconds);

            await userSchema.updateOne({username: userLogin.username},{token: token(), expiration_time: newDateObj.getTime()});
        }

        const userDbWithToken = await userSchema.findOne({username: userLogin.username}).exec();

        // Returns token
        res.status(200).json(userDbWithToken.token);
        
}catch(e){
    console.log(e)
}});



// Logout {token}
router.get('/logout',  async (req, res, next) => {
    try {
        const userLogout = req.query;
        
        // Check if session_token is provided
        if (!userLogout.token) {
            res.status(401).send({error : 'session_token is required'});
            next(new Error('session_token is required'))
        }
        console.log(userLogout.token);

        const userDb = await userSchema.findOne({token: userLogout.token}).exec();  

        // Check if token in Mongo Database
        if (userDb == null) {
            res.status(401).send({error : 'No user with this token'});
            next(new Error('No user with this token'))
        }
        console.log("Token correct")

        await userSchema.updateOne({token: userLogout.token},{token: "", expiration_time: ""});
        // Returns token
        res.status(200).json("Session successfully closed.");
        
}catch(e){
    console.log(e)
}
});

// Get users
router.get('/users', (req, res) => {
    userSchema
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}))
});


module.exports = router;