const express = require('express')
const router = express.Router()

const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const helpers = require('../_helpers')
const passport = require('../config/passport')

const adminController = require('../controllers/api/adminController.js')
const categoryController = require('../controllers/api/categoryController')
const userController = require('../controllers/api/userController.js')
const commentController = require('../controllers/api/commentController')
const restController = require('../controllers/api/restController.js')

const authenticated = passport.authenticate('jwt', { session: false })

const authenticatedAdmin = (req, res, next) => {
  if (helpers.getUser(req)) {
    if (helpers.getUser(req).isAdmin) { return next() }
    return res.json({ status: 'error', message: 'permission denied' })
  } else {
    return res.json({ status: 'error', message: 'permission denied' })
  }
}

router.post('/signup', userController.signUp)
router.post('/signin', userController.signIn)

router.get('/restaurants', authenticated, restController.getRestaurants)
router.get('/restaurants/feeds', authenticated, restController.getFeeds)
router.get('/restaurants/top', authenticated, restController.getTopRestaurant)
router.get('/restaurants/:id', authenticated, restController.getRestaurant)
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)

router.get('/admin/restaurants', authenticated, authenticatedAdmin, adminController.getRestaurants)
router.get('/admin/restaurants/:id', authenticated, authenticatedAdmin, adminController.getRestaurant)
router.post('/admin/restaurants', authenticated, authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
router.put('/admin/restaurants/:id', authenticated, authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
router.delete('/admin/restaurants/:id', authenticated, authenticatedAdmin, adminController.deleteRestaurant)

router.get('/admin/categories', authenticated, authenticatedAdmin, categoryController.getCategories)
router.get('/admin/categories/:id', authenticated, authenticatedAdmin, categoryController.getCategories)
router.post('/admin/categories', authenticated, authenticatedAdmin, categoryController.postCategory)
router.put('/admin/categories/:id', authenticated, authenticatedAdmin, categoryController.putCategory)
router.delete('/admin/categories/:id', authenticated, authenticatedAdmin, categoryController.deleteCategory)

router.post('/comments', authenticated, commentController.postComment)
router.delete('/comments/:id', authenticated, authenticatedAdmin, commentController.deleteComment)

module.exports = router
