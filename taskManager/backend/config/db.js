const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows / ISP DNS blocking MongoDB Atlas SRV lookups (querySrv ECONNREFUSED)
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // ignore if not allowed
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskmanager';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.error('Ensure MongoDB is running locally or specify a valid MONGODB_URI in backend/.env');
    process.exit(1);
  }
};

module.exports = connectDB;
