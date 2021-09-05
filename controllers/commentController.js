const commentService = require('../services/commentService')

const commentController = {
  postComment: (req, res) => {
    commentService.postComment(req, res, (data) => {
      if (data.status === 'success') {
        res.redirect(`/restaurants/${data.RestaurantId}`)
      }
    })
  },
  deleteComment: (req, res) => {
    commentService.deleteComment(req, res, (data) => {
      if (data.status === 'success') {
        res.redirect(`/restaurants/${data.RestaurantId}`)
      }
    })
  }
}

module.exports = commentController
