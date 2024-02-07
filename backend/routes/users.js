const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const userMiddleware = require('../middlewares/userMiddleware')

// Getting all
router.get('/', userController.getAllUsers)

// Getting one
router.get('/:id', userMiddleware.getUser, userController.getOneUserById)

// Creating one
router.post('/', userController.createUser)

// Login
router.post('/login', userController.loginUser)

// Updating one
router.put('/:id', userMiddleware.getUser, userController.updateUser)

// Deleting one
router.delete('/:id', userMiddleware.getUser, userController.deleteUser)

module.exports = router