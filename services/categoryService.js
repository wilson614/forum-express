const db = require('../models')
const Category = db.Category

const categoryService = {
  getCategories: (req, res, callback) => {
    return Category.findAll({
      raw: true,
      nest: true
    }).then(categories => {
      if (req.params.id) {
        Category.findByPk(req.params.id)
          .then((category) => {
            const data = { categories, category: category.toJSON() }
            callback(data)
          })
      } else {
        const data = { categories }
        callback(data)
      }
    })
  },
  postCategory: (req, res, callback) => {
    if (!req.body.name) {
      const data = { status: 'error', message: 'name didn\'t exist' }
      return callback(data)
    } else {
      return Category.create({
        name: req.body.name
      })
        .then(() => {
          const data = { status: 'success', message: 'category was successfully created' }
          callback(data)
        })
    }
  },
  putCategory: (req, res, callback) => {
    if (!req.body.name) {
      const data = { status: 'error', message: 'name didn\'t exist' }
      return callback(data)
    } else {
      return Category.findByPk(req.params.id)
        .then((category) => {
          category.update(req.body)
            .then(() => {
              const data = { status: 'success', message: 'category was successfully to update' }
              callback(data)
            })
        })
    }
  },
  deleteCategory: (req, res, callback) => {
    return Category.findByPk(req.params.id)
      .then((category) => {
        category.destroy()
          .then(() => {
            const data = { status: 'success', message: '' }
            callback(data)
          })
      })
  }
}

module.exports = categoryService
