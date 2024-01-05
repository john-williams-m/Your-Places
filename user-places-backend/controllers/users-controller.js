const { validationResult } = require('express-validator')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const HttpError = require('../models/http-error');

const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password')
    } catch (error) {
        return next(new HttpError('Fetching users failed, please try again', 500))
    }
    res.status(200).json({ users: users.map(u => u.toObject({ getters: true })) })
}

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422))
    }
    if (req.file.size > 1000000) {
        return next(new HttpError('Image Size is greater than 1MB', 422))
    }
    const { name, password, email } = req.body;
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (error) {
        const err = new HttpError('Signing up failed, please try again later', 500)
        return next(err);
    }

    if (existingUser) {
        const err = new HttpError('User exists already, please login instead ', 422)
        return next(err);
    }

    let hashedPassword
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (error) {
        return next(new HttpError('Could not create user, please try again.', 500))
    }

    const createdUser = new User({
        name: name,
        email,
        password: hashedPassword,
        image: req.file.path,
        places: []
    })
    let user;
    try {
        await createdUser.save()
    } catch (error) {
        const err = new HttpError('Signing up failed, please try again', 500);
        return next(err)
    }

    let token;

    try {
        token = jwt.sign({ userId: createdUser.id, email: createdUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
    } catch (error) {
        const err = new HttpError('Signing up failed, please try again', 500);
        return next(err)
    }

    res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token })
}

const login = async (req, res, next) => {
    const { email, password } = req.body
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email })
    } catch (error) {
        return next(new HttpError('Logging in falied, please try again.', 500))
    }


    if (!existingUser) {
        return next(new HttpError('Invalid credentials, could not log you in.', 403))
    }


    let isValidPassword = false
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password)
    } catch (error) {
        return next(new HttpError('Could not log you in, please check your credentials and try again.', 500))
    }

    if (!isValidPassword) {
        return next(new HttpError('Could not log you in, please check your credentials and try again.', 403))
    }


    let token;
    try {
        token = jwt.sign({ userId: existingUser.id, email: existingUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
    } catch (error) {
        const err = new HttpError('Logging in failed, please try again', 500);
        return next(err)
    }

    res.status(200).json({ userId: existingUser.id, email: existingUser.email, token })
}

exports.getUsers = getUsers
exports.signup = signup
exports.login = login