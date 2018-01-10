'use strict'

var express = require('express')
var router = express.Router()

module.exports =
  class FastRest {
    /**
    *  model:   the mongoose model.
    *  options: the options of settings since v1.0.7. Prev it isidField: the key field name.
    *  paramId: the params id name. This parameter should be included into options. Keep here for back compatible.
    *
    */
    constructor (model, options, paramId) {
      console.log(typeof (options))
      if (typeof (options) == 'object') {
        this.idField = options.idField || '_id'
        this.paramId = options.paramId || 'id'
      } else if (typeof (options) == 'string') {
        // for back compatible
        this.idField = options
      } else {
        this.idField = '_id'
      }

      this.paramId = paramId || this.paramId || 'id'
      console.log('this.idField=', this.idField)
      console.log('this.paramId=', this.paramId)

      this.model = model
      this.list = this.list.bind(this)
      this.detail = this.detail.bind(this)
      this.create = this.create.bind(this)
      this.update = this.update.bind(this)
      this.delete = this.delete.bind(this)
      this.router = this.router.bind(this)
    }

    router () {
      router.get('/', this.list)
      router.post('/', this.create)
      router.get('/:' + this.paramId, this.detail)
      router.put('/:' + this.paramId, this.update)
      router.delete('/:' + this.paramId, this.delete)

      return router
    }

    /**
     * get docs
     */
    list (req, res, next) {
      let filter = {}

      // Process the filters
      if (req.query && req.query.filters) {
        try {
          filter = JSON.parse(req.query.filters)
        } catch(e) {
          return res.status(400).json({
            message: 'Bad query filter',
            error: e
          })
        }
      }
      // Create a query
      let query = this.model.find(filter)

      // Process sort request
      if (req.query && req.query.sort) {
        try {
          let sort = JSON.parse(req.query.sort)
          query = query.sort(sort)
        } catch(e) {
          return res.status(400).json({
            message: 'Bad sort',
            error: e
          })
        }
      }

      // Process skip
      if (req.query && req.query.skip) {
        try {
          query = query.skip(parseInt(req.query.skip))
        } catch(e) {
          return res.status(400).json({
            message: 'Bad skip',
            error: e
          })
        }
      }

      // Process limit
      if (req.query && req.query.limit) {
        try {
          query = query.limit(parseInt(req.query.limit))
        } catch(e) {
          return res.status(400).json({
            message: 'Bad limit',
            error: e
          })
        }
      }

      // Process select request
      if (req.query && req.query.select) {
        try {
          let select = JSON.parse(req.query.select)
          query = query.select(select)
        } catch(e) {
          return res.status(400).json({
            message: 'Bad select',
            error: e
          })
        }
      }

      query.exec(function (err, docs) {
        if (err) {
          return res.status(500).json({
            message: 'Error getting doc list.',
            error: err
          })
        }
        res.json(docs)
      })
    }

    /**
     * get a doc by id
     */
    detail (req, res, next) {
      var id = req.params[this.paramId]
      var filter = {}
      if (id) {
        filter[this.idField] = id
      }
      let query = this.model.findOne(filter)

      // Process select request
      if (req.query && req.query.select) {
        try {
          let select = JSON.parse(req.query.select)
          query = query.select(select)
        } catch(e) {
          return res.status(400).json({
            message: 'Bad select',
            error: e
          })
        }
      }

      query.exec(function (err, doc) {
        if (err) {
          return res.status(500).json({
            message: 'Error the doc.',
            error: err
          })
        }
        res.json(doc)
      })
    }

    /**
     * create a new doc
     */
    create (req, res, next) {
      this.model.create(req.body, function (err, doc) {
        if (err) {
          return res.status(500).json({
            message: 'Error creating doc.',
            error: err
          })
        }
        return res.json(doc)
      })
    }

    /**
     * update doc
     */
    update (req, res, next) {
      var condition = {}
      condition[this.idField] = req.params[this.paramId]
      this.model.findOneAndUpdate(condition, {$set: req.body}, {new: true},
        function (err, doc) {
          if (err) {
            return res.status(500).json({
              message: 'Error updating doc',
              error: err
            })
          }
          return res.json(doc)
        })
    }

    /**
     * remove doc
     */
    delete (req, res, next) {
      var condition = {}
      condition[this.idField] = req.params[this.paramId]
      this.model.remove(condition, function (err, doc) {
        if (err) {
          return res.status(500).json({
            message: 'Error deleting doc.',
            error: err
          })
        }
        return res.json(doc)
      })
    }

    /**
     * The common middleware used to overwrite rquest, protect sensive data, etc.
     */
    queryMiddleware (options) {
      return function (req, res, next) {
        // if nothing passed, continue.
        if (!options) return next()

        // overwrite filters.
        if (options.filters) {
          if (!req.query.filters) {
            req.query.filters = JSON.stringify(options.filters)
          } else {
            try {
              let filters = JSON.parse(req.query.filters)
              for (var key in options.filters) {
                filters[key] = options.filters[key]
              }
              req.query.filters = JSON.stringify(filters)
            } catch(e) {
              return next(new errors.BadRequestError('Invalid query filters'))
            }
          }
        }
        // overwrite select.
        if (options.select) {
          if (!req.query.select) {
            req.query.select = JSON.stringify(options.select)
          } else {
            try {
              let select = JSON.parse(req.query.select)
              for (var key in options.select) {
                select[key] = options.select[key]
              }
              req.query.select = JSON.stringify(select)
            } catch(e) {
              return next(new errors.BadRequestError('Invalid query select'))
            }
          }
        }
        // overwrite sort.
        if (options.sort) {
          if (!req.query.sort) {
            req.query.sort = JSON.stringify(options.sort)
          } else {
            try {
              let sort = JSON.parse(req.query.sort)
              for (var key in options.sort) {
                sort[key] = options.sort[key]
              }
              req.query.sort = JSON.stringify(sort)
            } catch(e) {
              return next(new errors.BadRequestError('Invalid query sort'))
            }
          }
        }
        // overwrite skip
        if (options.skip) {
          req.query.skip = options.skip.toString()
        }
        // overwrite skip
        if (options.limit) {
          req.query.limit = options.limit.toString()
        }

        next()
      }
    }
}
