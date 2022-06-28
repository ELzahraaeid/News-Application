const mongoose = require('mongoose');
//creating user schema for user collection
const userSchema = new mongoose.Schema({
    fullname: String,
    email: String,
    password: String,
    subscriptions:[{type: String}]
    
});

module.exports = userSchema;