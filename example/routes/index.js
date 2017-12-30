var express = require('express')
var router = express.Router()

var Todos = require('../models/todos')
var FastRest = require('../../lib')
// var todos = new FastRest(Todos, '_id', 'id')
var todos = new FastRest(Todos)

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})

// insert data for test purpose.
router.get('/create', function (req, res, next) {
  let total = Todos.find({}, function (err, results) {
    if (!results || results.length == 0) {
      for (let i = 0;i < 5;i++) {
        Todos.create({
          title: 'title' + i,
          body: 'body' + i,
          date: new Date()
        }, function (err, doc) {
          // only returns when the last records is created.
          if (doc && doc.title == 'title4') {
            return res.send('Samples created')
          }
        })
      }
    } else {
      res.send('Samples already exist')
    }
  })
})

/* GET todo list. */
router.get('/mytodos', todos.list)
router.post('/mytodos', todos.create)
router.get('/mytodos/:id', todos.detail)
router.put('/mytodos/:id', todos.update)
router.delete('/mytodos/:id', todos.delete)

// Short cut for all the routes
router.use('/todos', todos.router())

module.exports = router
