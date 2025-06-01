import mongoose from "mongoose";
import chalk from "chalk";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
  
  } catch (error) {
    console.error(
      chalk.redBright(`❌ MongoDB connection error: ${error.message}`)
    );
    process.exit(1);
  }
};

export default connectDB;
