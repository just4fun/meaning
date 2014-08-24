mongoose = require "mongoose"
Category = mongoose.model "Category"

module.exports = ->
  (req, res, next) ->
    if !req.body.CategoryName
      return next new Error "No category name."
    Category.find().exec (err, categories) ->
      if err
        next new Error "Show category list failed: #{err}"
      else if categories && categories.length > 0
        #Update
        if req.category
          for category in categories
            if category.CategoryName is req.body.CategoryName and category._id.toString() isnt req.body._id
              next new Error "This name already exists."
              return
        #Create
        else
          for category in categories
            if category.CategoryName is req.body.CategoryName
              next new Error "This name already exists."
              return
        next()
      else
        next()