const userService = require('../services/userService')
const bcrypt = require('bcryptjs')
const db = require('../models')
const helpers = require('../_helpers')
const User = db.User

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
        }
      })
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },

  getUser: (req, res) => {
    userService.getUser(req, res, (data) => {
      return res.render('profile', data)
    })
  },

  editUser: (req, res) => {
    const user = helpers.getUser(req)
    if (user.id !== Number(req.params.id)) {
      req.flash('error_messages', 'you can only edit your own profile')
      return res.redirect(`/users/${user.id}/edit`)
    }
    return res.render('editUser', { user })
  },

  putUser: (req, res) => {
    userService.putUser(req, res, (data) => {
      if (data.status === 'error_empty') {
        req.flash('error_messages', data.message)
        return res.redirect('back')
      }

      if (data.status === 'error') {
        req.flash('error_messages', data.message)
        return res.redirect('back')
      }
      req.flash('success_messages', data.message)
      res.redirect(`/users/${req.params.id}`)
    })
  },
  addFavorite: (req, res) => {
    userService.addFavorite(req, res, (data) => {
      if (data.status === 'success') {
        return res.redirect('back')
      }
    })
  },
  removeFavorite: (req, res) => {
    userService.removeFavorite(req, res, (data) => {
      if (data.status === 'success') {
        return res.redirect('back')
      }
    })
  },
  like: (req, res) => {
    userService.like(req, res, (data) => {
      if (data.status === 'success') {
        return res.redirect('back')
      }
    })
  },
  unlike: (req, res) => {
    userService.unlike(req, res, (data) => {
      if (data.status === 'success') {
        return res.redirect('back')
      }
    })
  },
  getTopUser: (req, res) => {
    userService.getTopUser(req, res, (data) => {
      return res.render('topUser', data)
    })
  },
  addFollowing: (req, res) => {
    userService.addFollowing(req, res, (data) => {
      if (data.status === 'success') {
        return res.redirect('back')
      }
    })
  },
  removeFollowing: (req, res) => {
    userService.removeFollowing(req, res, (data) => {
      if (data.status === 'success') {
        return res.redirect('back')
      }
    })
  }
}

module.exports = userController
