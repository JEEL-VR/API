
const express = require("express");
const userSchema = require("../models/user")

const router = express.Router();

// Login { username, password }
router.get('/login',  async (req, res, next) => {
    
    try {
        const userLogin = req.body;
    
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


        // Date values
        const expirationTimeDb = new Date(userDb.expiration_time).getTime()
        const currentTime = new Date().getTime();
        
        // TODO: Check if the user has token in Mongo Database
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

        console.log("Token present")
    

            // TODO: Check if the user token expiration_time is valid

                // TODO: Generate token and expiration_time
        

        
        const userDbWithToken = await userSchema.findOne({username: userLogin.username}).exec();
        console.log("new user with token")


        // Returns token
        res.status(200).json(userDbWithToken.token);
        
}catch(e){
    console.log(e)
}});



// Logout {token}
router.get('/logout',  async (req, res, next) => {
    try {
        const userLogout = req.body;
        
        // Check if session_token is provided
        if (!userLogout.token) {
            res.status(401)
            next(new Error('session_token is required'))
        }
        console.log(userLogout.token);

        const userDb = await userSchema.findOne({token: userLogout.token}).exec();
        console.log(userDb)   

        // Check if token in Mongo Database
        if (userDb == null) {
            res.status(401)
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