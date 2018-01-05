# fast-rest

 Convert mongoose collection into REST APIs quickly with just few lines of code. You may choose where to mount and which one to mount. Work perfectly with express and express middleware.

## Installation

    npm install fast-rest

## Usage

### Create

Create mongoose model

    var Todos = require('../models/todos')

Create FastRest

    var FastRest = require('fast-rest')
    var todos = new FastRest(Todos)

You need to pass the mongoose model to FastRest. It returns an instance with five mount methods. Check next section for how to mount them.

### Mount

You could mount the route into any path.

    router.get('/mytodos', todos.list)
    router.post('/mytodos', todos.create)
    router.get('/mytodos/:id', todos.detail)
    router.put('/mytodos/:id', todos.update)
    router.delete('/mytodos/:id', todos.delete)

 Moreover, you may choose which method to be mounted. For example, I just need get methods, the the code will be:

    router.get('/mytodos', todos.list)
    router.get('/mytodos/:id', todos.detail)

You may also add other middleware to perform authertication.

    router.get('/mytodos', middleware.loginRequired, todos.list)
    router.post('/mytodos',middleware.adminRequired, todos.create)

Assume that middleware.loginRequired is to check whether or not the user is signed in. middleware.adminRequired is to check whether or not the user is admin.

There is also a shortcut if you want everything. Below code is equivalent to above 5 lines.

    router.use('/todos', todos.router())


### Query

Above code automatically generates below REST API from mongoose collection.

    GET     /todos
    POST    /todos
    GET     /todos/:id
    PUT     /todos/:id
    DELETE  /todos/:id

For the GET /todos method, you also could give the query parameters. The query parameters could include the following content:

- filters: the filters json object.
- skip: integer value.
- limit: integer value.
- sort: joson object for sort the result.
- select: the json object to select returned fields.

`http://localhost:3000/todos?filters={"title":"title100"}`
`http://localhost:3000/todos?filters={"$or":[{"title":"title100"}, {"title":"title1"}]}`
`http://localhost:3000/todos?sort={"title":"-1"}`
`http://localhost:3000/todos?sort={"title":"-1"}&skip=1`
`http://localhost:3000/todos?sort={"title":"-1"}&skip=1&limit=1`
`http://localhost:3000/todos?sort={"title":"-1"}&skip=1&limit=1&select={"title":1, "_id":0}`

### Custom

By default, the mongo collection use '_id' as the key. However, you may custom it when create FastRest.

    var todos = new FastRest(Todos, '_id', 'id')

'_id' is the key of the collection. 'id' is the url params. By default it is ':id', however you may use a different name when the ':id' is used.

For example, with the following code

    var todos = new FastRest(Todos, '_id', 'todoId')

The URI path will be

    router.get('/mytodos/:todoId', todos.detail)

### Security

Use express middleware to make sure API more secure. It is out of the scope of this package, though I can list two examples.

#### Control the query filters.

Sometimes, some fields are senstive, it may result unexpected result. Use middleware, you could exclude those fields from filters.

    router.get('/mytodos', function(req, res, next) {
      //the middleware to perform more control.
      //.... add/remove req.query.filters
      // delete req.query.filters.category

    }, todos.list)

#### Control returned fields.

If you want to exclude some fields from returned result, you could overwrite the query.select object in the middleware.

    router.get('/mytodos', function(req, res, next) {
      //the middleware to perform more control.
      //.... add/remove req.query.select

    }, todos.list)
