const util = require('util');                 //to promisify functions that take callback
const jwt = require('jsonwebtoken');          //to generate and verify the token
const safe = require('safe-await');           //Safely use async/await without all the try catch blocks
const joi = require('joi');                   //for validation
const { authorizationError } = require('../helpers/CustomError');
const {customError} = require('../helpers/CustomError');

const verifyAsync = util.promisify(jwt.verify);

//authorization middleware
exports.authorizeUser = async ( req, res, next ) => {
    const {token} = req.cookies
    const [err,payload] = await safe(verifyAsync(token, process.env.SECRET_KEY));
    if(err) throw authorizationError
    req.id = payload.id;
    next();
};

//signup validation schema
const signUpSchema = joi.object({ 
    fullname: joi.string().alphanum().min(3).max(30).required(),
    email: joi.string().email().required(), 
    password: joi.string().min(6).max(15).required()
}); 
//login validation schema
const loginSchema = joi.object({ 
    email: joi.string().email().required(), 
    password: joi.string().min(6).max(15).required()
});
//validation middleware        note: this middleware sould be removed when adding frontend
exports.validation = async(req, res, next) => {
    const [err,validated] = req.url === '/login' ? await safe (loginSchema.validateAsync(req.body)) : await safe(signUpSchema.validateAsync(req.body));
    if(err) throw customError(422,'VALIDATION_ERROR',err.message)
    next()
}