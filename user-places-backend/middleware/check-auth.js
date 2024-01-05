// if (process.env.NODE_ENV !== "production") {
//     require('dotenv').config();
// }

const HttpError = require("../models/http-error");
const jwt = require('jsonwebtoken')
module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            throw new Error('Authentication failed!');
        }
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = { userId: decodedData.userId }
        next();
    } catch (error) {
        return next(new HttpError('Authentication falied!', 403))
    }

}