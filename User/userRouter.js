const express = require('express');                                  //minimal framework to generate server insteade of using http
const bcrypt = require('bcrypt');                                    //password-hashing module
const util = require('util');                                        //to promisify functions that take callback
const jwt = require('jsonwebtoken');                                 //to generate and verify the token
const axios = require('axios');                                      //make requestes on another server

const UserModel = require('./userModel');                            //userModel custom module 
const {customError, authError} = require('../helpers/CustomError');  //custom errors
const { authorizeUser } = require('./middlewares');                  // authorization middleware

const userRouter = express.Router();                                 //create module/router
const signAsync = util.promisify(jwt.sign);                          //promisify sign function to create token




userRouter.post('/signup', async (req, res) => {

    const { fullname, email, password } = req.body;
    const checkUserExist = await UserModel.findOne({ email });
    checkUserExist? (() => {throw customError(410,'User Already Exist ','User Already Exist')})(): null
    const saltRounds = parseInt(process.env.SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await UserModel.create({
      fullname: fullname,
      email: email,
      password: hashedPassword
    });
    res.send({ success: true });
  });

userRouter.post('/login', async (req, res)=> {
    
    const { email, password } = req.body;
    const user = await UserModel.findOne({email});
    if(!user) throw authError;
    const result = await bcrypt.compare(password, user.password);
    if(!result)throw authError;

    const token = await signAsync({
      id: user.id,
      admin: false
    }, process.env.SECRET_KEY);
    res.cookie('token', token, { maxAge: 900000, httpOnly: true }); 
    res.send({success:true});  
});

userRouter.get(['/','/home'], authorizeUser, async (req, res)=> {
    
    const id = req.id;
    const user = await UserModel.findById(id);
    const subscribedData = (user.subscriptions).join();
    const url = `https://newsapi.org/v2/everything?sources=${subscribedData}&apiKey=855514ec0bfc4307bef20b315e03ef4a`;
    const news = await axios.get(url);
    const articles = news.data.articles;
    res.send(articles);
});

userRouter.get('/sources', authorizeUser, async (req, res)=> {
    
    const id = req.id;
    const url = 'https://newsapi.org/v2/top-headlines/sources?apiKey=855514ec0bfc4307bef20b315e03ef4a';
    let news, user;

    await Promise.all([
        await axios.get(url),
        await UserModel.findById(id)
    ]).then(data =>{
      [news, user] =data;
    })
    
    const subscribedData = user.subscriptions;
    const data = news.data.sources;
    const updatedData = data.map((ele) => ({...ele, subscribe: subscribedData.indexOf(ele.id) === -1? false: true}));
    res.send(updatedData);
        
});

userRouter.patch('/subscribe', authorizeUser, async(req, res)=>{
    const {topic, value} = req.query
    const id = req.id
    await UserModel.findByIdAndUpdate(id, value ==='true'?{$push: {subscriptions: topic}}:{$pull: {subscriptions: topic}});
    res.send({success:true})
})

userRouter.get('/logout', authorizeUser, (req, res) => {
    res.clearCookie('token');
    res.send({success:true});
});

module.exports = userRouter;