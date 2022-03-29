
const express = require("express");
const pinSchema = require("../models/pin")
const courseSchema = require("../models/course")
const userSchema = require("../models/user")
const router = express.Router();

// Creates a pin manually
router.post('/pin', (req, res) => {
    const pin = pinSchema(req.body);
    pin.save()
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}))
});

// Creates and returns a new pin
router.get('/pin_request', async (req, res, next) => {
    try {

        const userPinRequest = req.query;
    
        // Check if token is provided
        if (!userPinRequest.session_token) {
            res.status(401).send({error : 'Session token is required'});
            return next(new Error('Session token is required'))
        }

        console.log(userPinRequest.session_token);

        // Check if token exists
        const userDb = await userSchema.findOne({token: userPinRequest.session_token}).exec();
        
        if(userDb == null){
            res.status(401).send({error : 'Incorrect session token'});
            return next(new Error('Incorrect session token'))
        }

        console.log(userDb)

        // Check if token has expired
        
        // Date values
        const expirationTimeDb = new Date(userDb.expiration_time).getTime()
        const currentTime = new Date().getTime();

        if(expirationTimeDb < currentTime){
            res.status(401).send({error : 'Token has expired'});
            return next(new Error('Token has expired'))
        }

        // Check if VRTaskID is provided
        if(!userPinRequest.VRtaskID){
            res.status(401).send({error : 'VRtaskID is required'});
            return next(new Error('VRtaskID is required'))
        }

        // Conver VRTaskID to integer
        userPinRequest_VRtaskID = -1

        try {
            userPinRequest_VRtaskID = parseInt(userPinRequest.VRtaskID)
        } catch (error) {
            res.status(401).send({error : 'Not a valid VRtaskID'});
            return next(new Error('Not a valid VRtaskID'))
        }

        userDb.id

        console.log(userPinRequest_VRtaskID)

        // Check if student is subscribed to this vr_task
        const courseDB = await courseSchema.findOne({"vr_tasks.ID": userPinRequest_VRtaskID, "subscribers.students": userDb.id}).exec();
        console.log(courseDB)
        console.log(userPinRequest_VRtaskID)
        console.log(userDb.id)
        if(courseDB == null){
            res.status(401).send({error : 'Not suscribed to this VRtaskID'});
            return next(new Error('Not suscribed to this VRtaskID'))
        }
        

        // Retrieve VRexID property from the vr_task
        
        const vrTask = courseDB.get("vr_tasks");
        var vr_exercise_id = -1
        
        for (var k in vrTask){
            let vr_task_id = vrTask[k].ID
            
            if (vr_task_id == userPinRequest_VRtaskID) {
                vr_exercise_id = vrTask[k].VRexID
                console.log("vr_task_id = " + vr_task_id + " : vr_exercise_id = " + vr_exercise_id)
                break
            }
            
        }

       
        // Generates 4 digits random pin
        var randomPin = Math.floor(1000 + Math.random() * 9000);
        console.log(randomPin + " pin created");

        
        // Check if pin is already in pins Collection
        
        var invalidPin = true;

        while (invalidPin) {

            // Find generated pin
            const pinDB = await pinSchema.findOne({pin: String(randomPin)}).exec();

            // Generate new pin until it is available
            if( pinDB != null){
                console.log(randomPin + " already exist. Generating new pin.");
                randomPin = Math.floor(1000 + Math.random() * 9000);
            }else{
                invalidPin = false;
            }
        }
        

        console.log(randomPin + " pin valid")
        
        // Check if there is already a pin generated in the VR_task of this user
        const pinDB = await pinSchema.findOne({vr_task_id: userPinRequest_VRtaskID, username: userDb.username}).exec();

        if(pinDB == null){
            
            // Creates new pin document
            const newPinDocument = pinSchema({pin: randomPin, username: userDb.username, vr_task_id: userPinRequest_VRtaskID, vr_exercise_id: vr_exercise_id });
            
            // Save new document into pins collection
            newPinDocument.save();
            console.log("New Pin Document saved successfully.")
            console.log(newPinDocument)
            // Returns pin
            res.status(200).json(newPinDocument.pin);
            console.log(newPinDocument.pin + " retrieved successfully.")

        }else{
            // Returns pin of pins Collection
            res.status(200).json(pinDB.pin);
            console.log(pinDB.pin + " pin retrieved successfully from collection.")
        }
        

        }catch(e){
            console.log(e)
    }
});


// Returns username and VRexerciseID with pin provided
router.get('/start_vr_exercise', async (req, res, next) => {
    try {

        const userPinRequest = req.query;

        // Check if pin is provided
        if (!userPinRequest.pin){
            res.status(401).send({error: 'pin not provided'});
            return next( new Error("pin not provided"));
        }
        // Check if pin is valid

        pinDb = await pinSchema.findOne({pin: userPinRequest.pin}).exec();

        if (pinDb == null) {
            res.status(401).send({error: 'incorrect pin'});
            return next(new Error("Incorrect pin"));
        }

        // Optional: Retrieve minExerciseVersion, VR Headset required
        
        // If valid pin, returns username and VRexerciseID
        res.status(200).send({username: pinDb.username, VRexerciseID: pinDb.vr_exercise_id});        
        

        }catch(e){
            console.log(e)
    }
});


// Stores vr_exercise result data
router.post('/finish_vr_exercise', async (req, res, next) => {
    try {

        const userExerciseData = req.body;

        // Check if pin is provided

        if (!userExerciseData.pin){
            res.status(401).send({error: 'pin not provided'});
            return next( new Error("pin not provided"));
        }
        
        // Check if pin is valid

        pinDb = await pinSchema.findOne({pin: userExerciseData.pin}).exec();

        if (pinDb == null) {
            res.status(401).send({error: 'incorrect pin'});
            return next(new Error("Incorrect pin"));
        }

        // Check if record is provided

        if (!userExerciseData.record){
            res.status(401).send({error: 'record not provided'});
            return next( new Error("record not provided"));
        }

        // Check if VRexerciseID is provided

        if (!userExerciseData.VRexerciseID){
            res.status(401).send({error: 'VRexerciseID not provided'});
            return next( new Error("VRexerciseID not provided"));
        }

        // Check if VRexerciseID matches pin vr_exercise_id
        console.log("user pin: "+userExerciseData.VRexerciseID)
        console.log("pinDb pin: " + pinDb.vr_exercise_id)
        
        if (userExerciseData.VRexerciseID !== pinDb.vr_exercise_id){
            res.status(401).send({error: 'VRexerciseID not valid'});
            return next( new Error("VRexerciseID not valid"));
        }

        console.log("Correct VRexerciseID")
        
        const userDb = await userSchema.findOne({username: pinDb.username})

        console.log(userDb.username)

        // JSON to save in completions vr_task
        var exercise = {"studentID": userDb.id, 
                        "autograde":{"passed_items": userExerciseData.record.passed_items, "failed_items": userExerciseData.record.failed_items}, 
                        "grade": userExerciseData.record.grade};
        
        console.log(exercise)

        // Method to find in which vr_task update completions 
        const courseDB = await courseSchema.findOne({'subscribers.students': userDb.id, 'vr_tasks.ID': pinDb.vr_task_id, 'vr_tasks.VRexID': pinDb.vr_exercise_id}).exec();
        const vrTask = courseDB.get("vr_tasks");
        var counter = 0; // vr_task collection number

        for (var k in vrTask){
            let vr_task_id = vrTask[k].ID
            let vr_exercise_id = vrTask[k].VRexID
            if (vr_task_id == pinDb.vr_task_id && vr_exercise_id == pinDb.vr_exercise_id) {
                
                console.log("vr_task_id = " + vr_task_id + " : vr_exercise_id = " + vr_exercise_id + "counter = " + counter )
                break
            }
            counter++;
        }

        // Updates vr_task completions
        await courseSchema.findOneAndUpdate({'subscribers.students': userDb.id, 'vr_tasks.ID': pinDb.vr_task_id, 'vr_tasks.VRexID': pinDb.vr_exercise_id},
                                        {'$push': { [`vr_tasks.${counter}.completions`] : exercise}}).exec();
        
        res.status(200).send({Succes:"Exercise data updated"});        
        
        }catch(e){
            console.log(e)
    }
});


module.exports = router;