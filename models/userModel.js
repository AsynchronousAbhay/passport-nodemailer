const mongoose = require('mongoose')
const plm = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    name: String,
    email: String,
    phone: String,
    password: String,
    resetPasswordToken: 0,
});

userSchema.plugin(plm); //-- USE WHEN LOGIN WITH USERNAME..
                        // ----0R------
// userSchema.plugin(plm, { usernameField: "email" }); ----- WHEN YOU WHANT TO LOGIN WITH EMAIL..

const User = mongoose.model('User', userSchema);

module.exports = User;

