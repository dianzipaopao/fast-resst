var express = require('express')
var router = express.Router()

var Todos = require('../models/todos')
var FastRest = require('../../lib')
// var todos = new FastRest(Todos, '_id', 'id')
var todos = new FastRest(Todos)
var todos2 = new FastRest(Todos, {
  idField: 'title', // the key filed is "title"
  paramId: 'title'
})

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

// Setup the route with new constructor.
router.get('/td', todos2.list)
router.post('/td', todos2.create)
router.get('/td/:title', todos2.detail)
router.put('/td/:title', todos2.update)
router.delete('/td/:title', todos2.delete)

// Use middleware
router.get('/mtd', todos2.queryMiddleware({
  'filters': {
    'title': 'title2'
  }
}), todos2.list)
router.get('/mtd/:title', todos2.queryMiddleware({
  'select': {
    '__v': 0 // do not return field
  }
}), todos2.detail)

module.exports = router
