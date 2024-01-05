const express = require('express')
const { check } = require('express-validator')
const multer = require('multer')
const router = express.Router();
const { getPlaceById, getPlacesByUserId, createPlace, deletePlace, updatePlaceById } = require('../controllers/places-controller');
const checkAuth = require('../middleware/check-auth')
const { storage } = require('../middleware/cloudinary')
const fileUpload = multer({ storage })
router.get('/:placeId', getPlaceById)

router.get('/user/:userId', getPlacesByUserId)

router.use(checkAuth)

router.post('/',
    fileUpload.single('image'),
    [
        check('title').not().isEmpty(),
        check('description').isLength({ min: 5 }),
        check('address').not().isEmpty()
    ],
    createPlace)

router.patch('/:placeId',
    [
        check('title').not().isEmpty(),
        check('description').isLength({ min: 5 })
    ], updatePlaceById)

router.delete('/:placeId',
    [

    ], deletePlace)

module.exports = router;