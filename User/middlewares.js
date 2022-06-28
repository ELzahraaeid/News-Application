const util = require('util');                 //to promisify functions that take callback
const jwt = require('jsonwebtoken');          //to generate and verify the token
const safe = require('safe-await');           //Safely use async/await without all the try catch blocks

const { authorizationError } = require('../helpers/CustomError');

const verifyAsync = util.promisify(jwt.verify);

//authorization middleware
exports.authorizeUser = async ( req, res, next ) => {
    const {token} = req.cookies
    const [err,payload] = await safe(verifyAsync(token, process.env.SECRET_KEY));
    if(err) throw authorizationError
    req.id = payload.id;
    next();
};