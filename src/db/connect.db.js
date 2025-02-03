import mongoose from "mongoose";

const connectDB = async () => {
  try {
    let mongodbUri = process.env.MONGODB_URI
      .replace("<db_username>", process.env.MONGODB_USERNAME)
      .replace("<db_password>", process.env.MONGODB_PASS)
      .replace("<db_name>", process.env.MONGODB_DBNAME);
    const connectionInstance = await mongoose.connect(mongodbUri);
    console.log(`Connected to MongoDB ${connectionInstance.connection.db}, DB Host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("MongoDb connection Failure",error);
    process.exit(1);
  }
}

export default connectDB;