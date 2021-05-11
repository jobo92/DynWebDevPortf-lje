const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: String,
    password: String,
    items: Array,
    highscore: Number
});

module.exports = mongoose.model('User', UserSchema);