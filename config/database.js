const mongose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
    try {
        const conn = await mongose.connect(config.databaseURI);
        console.log(`MongoDB Connected: ${conn.connection.host}`); 
    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit();
    }
}

module.exports = connectDB;