const express = require('express')
const multer = require('multer')
const { check } = require('express-validator')
const { getUsers, login, signup } = require('../controllers/users-controller')
const { storage } = require('../middleware/cloudinary')
const fileUpload = multer({ storage })
const router = express.Router()

router.get('/', getUsers)

router.post('/login', login)

router.post('/signup',
    fileUpload.single('image'),
    [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({ min: 6 })
    ], signup)

module.exports = router