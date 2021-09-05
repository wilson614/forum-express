const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const db = require('../models')
const helpers = require('../_helpers')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship

const userService = {
  getUser: (req, res, callback) => {
    const userId = req.params.id
    const user = helpers.getUser(req)
    User.findByPk(userId, {
      include: [
        { model: Restaurant, as: 'FavoritedRestaurants' },
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' }
      ]
    })
      .then(userFind => {
        Comment.findAll({
          raw: true,
          nest: true,
          include: Restaurant,
          where: { userId }
        })
          .then(result => {
            const commentData = result.map(comment => ({
              ...comment.dataValues,
              restaurantImage: comment.Restaurant.image,
              restaurantId: comment.Restaurant.id
            }))
            const set = new Set()
            const comments = commentData.filter(item => !set.has(item.restaurantId) ? set.add(item.restaurantId) : false)
            const commentCount = comments.length
            const favorites = userFind.FavoritedRestaurants
            const favoriteCount = favorites.length
            const followings = userFind.Followings
            const followingCount = followings.length
            const followers = userFind.Followers
            const followerCount = followers.length
            const data = { userFind: userFind.toJSON(), user, commentCount, comments, favoriteCount, followingCount, followerCount, followings, followers, favorites }
            return callback(data)
          })
      })
  },

  putUser: (req, res, callback) => {
    if (!req.body.name) {
      const data = { status: 'error_empty', message: "name didn't exist" }
      return callback(data)
    }

    if (helpers.getUser(req).id !== Number(req.params.id)) {
      const data = { status: 'error', message: "you can't edit other's profile" }
      return callback(data)
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        if (err) {
          return console.log(err)
        }
        return User.findByPk(req.params.id)
          .then((user) => {
            user.update({
              name: req.body.name,
              image: file ? img.data.link : user.image
            })
              .then(() => {
                const data = { status: 'success', message: 'user was successfully to update' }
                return callback(data)
              })
          })
      })
    } else {
      return User.findByPk(req.params.id)
        .then((user) => {
          user.update({
            name: req.body.name,
            image: user.image
          })
            .then(() => {
              const data = { status: 'success', message: 'user was successfully to update' }
              return callback(data)
            })
        })
    }
  },
  addFavorite: (req, res, callback) => {
    return Favorite.create({
      UserId: helpers.getUser(req).id,
      RestaurantId: req.params.restaurantId
    })
      .then(() => {
        const data = { status: 'success', message: '' }
        return callback(data)
      })
  },
  removeFavorite: (req, res, callback) => {
    return Favorite.findOne({
      where: {
        UserId: helpers.getUser(req).id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((favorite) => {
        favorite.destroy()
          .then(() => {
            const data = { status: 'success', message: '' }
            return callback(data)
          })
      })
  },
  like: (req, res, callback) => {
    return Like.create({
      UserId: helpers.getUser(req).id,
      RestaurantId: req.params.restaurantId
    })
      .then(() => {
        const data = { status: 'success', message: '' }
        return callback(data)
      })
  },
  unlike: (req, res, callback) => {
    return Like.findOne({
      where: {
        UserId: helpers.getUser(req).id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((like) => {
        like.destroy()
          .then(() => {
            const data = { status: 'success', message: '' }
            return callback(data)
          })
      })
  },
  getTopUser: (req, res, callback) => {
    return User.findAll({
      include: [
        { model: User, as: 'Followers' }
      ]
    }).then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: helpers.getUser(req).Followings.map(d => d.id).includes(user.id)
      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      const data = { users }
      return callback(data)
    })
  },
  addFollowing: (req, res, callback) => {
    return Followship.create({
      followerId: helpers.getUser(req).id,
      followingId: req.params.userId
    })
      .then(() => {
        const data = { status: 'success', message: '' }
        return callback(data)
      })
  },

  removeFollowing: (req, res, callback) => {
    return Followship.findOne({
      where: {
        followerId: helpers.getUser(req).id,
        followingId: req.params.userId
      }
    })
      .then((followship) => {
        followship.destroy()
          .then(() => {
            const data = { status: 'success', message: '' }
            return callback(data)
          })
      })
  }
}

module.exports = userService
