import mongoose from "mongoose";

const connectDatabase = async () => {
  const MONGO_HOST = process.env.MONGO_HOST || "localhost";
  const MONGO_USER = process.env.MONGO_USER;
  const MONGO_PASS = process.env.MONGO_PASS;
  const MONGO_DB_NAME = process.env.MONGO_DB_NAME;

  let mongoUrl = "mongodb+srv://";
  // Check user/pass
  if (MONGO_USER && MONGO_PASS)
    mongoUrl = `${mongoUrl}${MONGO_USER}:${MONGO_PASS}@`;
  // Add host
  mongoUrl = `${mongoUrl}${MONGO_HOST}`;
  // Add DB name
  mongoUrl = `${mongoUrl}/${MONGO_DB_NAME}`;

  console.log("Connecting to database...");

  try {
    await mongoose.connect(mongoUrl);
    console.info("Connected to database");
  } catch (error) {
    console.error(error);
    process.exit();
  }
};

export default connectDatabase;
