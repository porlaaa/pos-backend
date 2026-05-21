require('dotenv').config();

const config = Object.freeze({
    PORT: process.env.PORT || 5000,
    databaseURI: process.env.MONGO_URI || 'mongodb://localhost:27017/pos-db',
    nodeEnv : process.env.NODE_ENV || 'development',
    accessTokenSecret: process.env.JWT_SECRET,
});

module.exports = config;