const mongoose = require('mongoose');


async function connectDB(){

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Database connect successfully');
        
    } catch (error) {
        console.log('Database connection error',error);
        throw error;
    }
}

module.exports= connectDB;
