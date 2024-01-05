if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express')
const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const placeRoutes = require('./routes/places-routes');
const UsersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');
const { cloudinary } = require('./middleware/cloudinary');
const { inject } = require('@vercel/analytics');

const app = express();

app.use(bodyParser.json());

inject();

app.use('/uploads/images', express.static(path.join('uploads', 'images')))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');

    next();
});

app.use('/api/places', placeRoutes);
app.use('/api/users', UsersRoutes)

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404)
    throw error;
})

app.use((error, req, res, next) => {
    if (req.file) {
        cloudinary.uploader.destroy(req.file.filename)
    }
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500).json({ message: error.message || 'An unknown error occurred!' });
})
const DB_URL = process.env.DB_URL || "mongodb://localhost:27017/user-places-mern"
const PORT = process.env.PORT || 8080
mongoose.connect(DB_URL).then(() => {
    app.listen(PORT);
    console.log('Connected to DB and listening..')
}).catch(err => {
    console.log(err)
})