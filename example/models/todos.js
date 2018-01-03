var mongoose = require('mongoose');

var Schema = mongoose.Schema

var TodosSchema = new Schema({
    title     : String,
    body      : String,
    date      : Date
});

module.exports = mongoose.model('Todos', TodosSchema);
