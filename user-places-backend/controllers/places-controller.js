const { validationResult } = require('express-validator')
const fs = require('fs')
const HttpError = require('../models/http-error');
const Place = require('../models/place');
const User = require('../models/user');
const { cloudinary } = require('../middleware/cloudinary')

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.placeId;
    let place;
    try {
        place = await Place.findById(placeId);
    } catch (error) {
        const err = new HttpError('Something went wrong, could not find a place.', 500)
        return next(err);
    }
    if (!place) {
        const err = new HttpError('Could not find a place for the provided id.')
        return next(err);
    }
    res.status(200).json({ place: place.toObject({ getters: true }) });
}

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.userId;
    let userWithPlaces;
    try {
        userWithPlaces = await User.findById(userId).populate('places');
    } catch (error) {
        const err = new HttpError('Fetching places failed, please try again later.', 500)
        return next(err);
    }
    if (!userWithPlaces || userWithPlaces.length === 0) {
        return next(new HttpError('Could not find a places for the provided user id.'));
    }
    res.status(200).json({ places: userWithPlaces.toObject({ getters: true }).places });
}

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }
    if (req.file.size > 1000000) {
        return next(new HttpError('Image Size is greater than 1MB', 422))
    }
    const { title, description, address } = req.body;
    const createdPlace = new Place({
        title,
        description,
        address,
        location: {
            lat: 13.0437224,
            lng: 80.2663439
        },
        image: req.file.path,
        creator: req.userData.userId
    })

    let user;
    try {
        user = await User.findById(req.userData.userId)
    } catch (error) {
        const err = new HttpError('Creating place failed, please try again', 500)
        return next(err);
    }


    if (!user) {
        return next(new HttpError('Could not find user for provided id', 404))
    }


    try {
        // const session = await mongoose.startSession();
        // session.startTransaction();
        // await createdPlace.save({ session: session });
        // user.places.push(createdPlace)
        // await user.save({ session: session });
        // await session.commitTransaction()
        // await session.endSession()
        await createdPlace.save();
        user.places.push(createdPlace)
        await user.save()
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again.', 500);
        return next(err, err.code);
    }
    res.status(201).json({ place: createdPlace.toObject({ getters: true }) });
}

const updatePlaceById = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422))
    }
    const { title, description } = req.body;
    const placeId = req.params.placeId;

    let place;
    try {
        place = await Place.findById(placeId)
    } catch (error) {
        const err = new HttpError('Something went wrong, try again later.', 500)
        return next(err);
    }

    if (place.creator.toString() !== req.userData.userId) {
        return next(new HttpError('You are not allowed to edit this place.', 401))
    }

    place.title = title
    place.description = description

    try {
        await place.save();
    } catch (error) {
        const err = new HttpError('Something went wrong, try again later.', 500)
        return next(err)
    }

    res.status(200).json({ place: place.toObject({ getters: true }) })


}
const deletePlace = async (req, res, next) => {
    const placeId = req.params.placeId
    let place;
    try {
        let exisitingPlace = await Place.findById(placeId);
        if (exisitingPlace.creator.toString() !== req.userData.userId) {
            return next(new HttpError('You are not allowed to delete this place.', 401))
        }
        place = await Place.findByIdAndRemove(placeId).populate('creator');
    } catch (error) {
        const err = new HttpError('Somethin went wrong, please try again.', 500);
        return next(err);
    }


    if (!place) {
        return next(new HttpError('Could not find place for this id', 404))
    }


    // if (place.creator.id !== req.userData.userId) {
    //     return next(new HttpError('You are not allowed to delete this place.', 401))
    // }

    const imagePath = place.image;

    try {
        const user = await User.findById(place.creator)
        user.places.pull(place);
        await user.save();
        // await place.remove();
        // place.creator.places.pull(place)
        // await place.creator.save()
    } catch (error) {
        const err = new HttpError('Something went wrong, please try again.', 500);
        return next(err);
    }
    // console.log(req.file)
    // console.log(req.file.filename)
    // cloudinary.uploader.destroy(req.file.filename)
    res.status(200).json({ message: 'Deleted Place.' })
}


exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace
exports.updatePlaceById = updatePlaceById
exports.deletePlace = deletePlace