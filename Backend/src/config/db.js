const mongoose = require('mongoose');
const  config  = require('./config');

async function connectDB() {
    try {
        await mongoose.connect(config.MONGO_URI)
        console.log("Database connected successfully..");
    } catch (error) {
        console.error("Database not connected..", error);
        process.exit(1);
    }
}

module.exports = connectDB
