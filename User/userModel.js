const mongoose = require('mongoose');
const userSchema = require('./userSchema');
//creating user collection in database
const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;