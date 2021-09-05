const helpers = require('../_helpers')
const db = require('../models')
const Comment = db.Comment

const commentService = {
  postComment: (req, res, callback) => {
    return Comment.create({
      text: req.body.text,
      RestaurantId: req.body.restaurantId,
      UserId: helpers.getUser(req).id
    })
      .then((comment) => {
        const data = { status: 'success', message: '', RestaurantId: comment.RestaurantId }
        callback(data)
      })
  },
  deleteComment: (req, res, callback) => {
    return Comment.findByPk(req.params.id)
      .then((comment) => {
        comment.destroy()
          .then((comment) => {
            const data = { status: 'success', message: '', RestaurantId: comment.RestaurantId }
            callback(data)
          })
      })
  }
}

module.exports = commentService
