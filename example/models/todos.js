var mongoose = require('mongoose')

var Schema = mongoose.Schema

var TodosSchema = new Schema({
  title: {
    type: String,
    unique: true,
    required: true
  },
  body: String,
  date: Date
})

module.exports = mongoose.model('Todos', TodosSchema)
