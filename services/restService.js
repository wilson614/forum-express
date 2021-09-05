const helpers = require('../_helpers')
const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User

const pageLimit = 10

const restService = {
  getRestaurants: (req, res, callback) => {
    let offset = 0
    const whereQuery = {}
    let categoryId = ''

    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }

    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery.categoryId = categoryId
    }
    Restaurant.findAndCountAll({ include: Category, where: whereQuery, offset, limit: pageLimit }).then(result => {
      const page = Number(req.query.page) || 1
      const pages = Math.ceil(result.count / pageLimit)
      const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      const prev = page - 1 < 1 ? 1 : page - 1
      const next = page + 1 > pages ? pages : page + 1
      const restdata = result.rows.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.Category.name,
        isFavorited: helpers.getUser(req).FavoritedRestaurants.map(d => d.id).includes(r.id),
        isLiked: helpers.getUser(req).LikedRestaurants.map(d => d.id).includes(r.id)
      }))
      Category.findAll({
        raw: true,
        nest: true
      }).then(categories => {
        const data = {
          restaurants: restdata,
          categories,
          categoryId,
          page,
          totalPage,
          prev,
          next
        }
        callback(data)
      })
    })
  },
  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' },
        { model: Comment, include: [User] }
      ]
    }).then(restaurant => {
      const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(helpers.getUser(req).id)
      const isLiked = restaurant.LikedUsers.map(d => d.id).includes(helpers.getUser(req).id)
      restaurant.increment(['viewCounts'], { by: 1 })
      const data = {
        restaurant: restaurant.toJSON(),
        isFavorited,
        isLiked
      }
      callback(data)
    })
  },
  getFeeds: (req, res, callback) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [Category]
      }),
      Comment.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      })
    ]).then(([restaurants, comments]) => {
      const data = {
        restaurants: restaurants,
        comments: comments
      }
      callback(data)
    })
  },
  getDashboard: (req, res, callback) => {
    const restaurantId = req.params.id
    return Restaurant.findByPk(restaurantId, {
      include: [
        Category,
        { model: Comment, include: [User] }
      ]
    }).then(restaurant => {
      Comment.findAndCountAll({ where: { restaurantId } })
        .then(result => {
          const data = {
            restaurant: restaurant.toJSON(),
            commentAmount: result.count
          }
          callback(data)
        })
    })
  },
  getTopRestaurant: (req, res, callback) => {
    return Restaurant.findAll({
      include: [
        { model: User, as: 'FavoritedUsers' }
      ],
      limit: 10
    }).then(restaurants => {
      restaurants = restaurants.map(restaurant => ({
        ...restaurant.dataValues,
        description: restaurant.dataValues.description.substring(0, 50),
        FavoriteCount: restaurant.FavoritedUsers.length,
        isFavorited: helpers.getUser(req).FavoritedRestaurants.map(d => d.id).includes(restaurant.id)
      }))
      restaurants = restaurants.sort((a, b) => b.FavoriteCount - a.FavoriteCount)
      const data = { restaurants }
      callback(data)
    })
  }
}

module.exports = restService
