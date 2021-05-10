const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookSchema = new Schema({
    title: String,
    author: String,
    category: String
});

BookSchema.methods.speak = function () {
    let greeting = this.name
      ? "My title is " + this.name
      : "I don't have a title";
    console.log(greeting);
  }

module.exports = mongoose.model('Book', BookSchema);