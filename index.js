const express = require('express');                  //minimal framework to generate server insteade of using http
const cookieParser = require('cookie-parser');       //for parsing cookie header
require('express-async-errors');                     //to get rid of alot of inserting try/catch
const userRouter = require('./user/userRouter');     //user custom module

require('dotenv').config();                          //configure environmental variables
require('./dbConnection');                           //database connection

const port = process.env.PORT || 3000;
const app = express();


app.use(express.json());                            //for parsing request body
app.use(cookieParser());                            //Parse Cookie header and populate req.cookies with an object keyed by the cookie names

//to know if the server is running
app.get('/', (req, res)=>{
    res.send({success: true});
})
//for routing requests that come to the user topic
app.use('/user', userRouter);


//Error middleware
app.use((err, req, res, next) => {
    if(!err.status){
        err.message = "something went wrong";
    } 
    res.status(err.status || 500).send({ message: err.message});
})

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
  });