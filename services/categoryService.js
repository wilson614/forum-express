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
  }
}

module.exports = categoryService
