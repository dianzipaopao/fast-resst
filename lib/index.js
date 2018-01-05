'use strict'

var express = require('express')
var router = express.Router()

module.exports =
  class FastRest {
    /**
    *  model:   the mongoose model.
    *  idField: the key field name.
    *  paramId: the params id name.
    */
    constructor (model, idField, paramId) {
      this.idField = idField || '_id'
      this.paramId = paramId || 'id'
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
      console.log('q: ', req.query)
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
      this.model.findOne(filter, function (err, doc) {
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
      var id = req.params[this.paramId]
      var filter = {}
      filter[this.idField] = id
      this.model.findOneAndUpdate(filter, {$set: req.body}, {new: true},
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
      var id = req.params[this.paramId]
      this.model.findByIdAndRemove(id, function (err, doc) {
        if (err) {
          return res.status(500).json({
            message: 'Error deleting doc.',
            error: err
          })
        }
        return res.json(doc)
      })
    }
}
