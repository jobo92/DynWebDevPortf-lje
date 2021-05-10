const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
    name: String,
    items: Array
});

module.exports = mongoose.model('Room', RoomSchema);