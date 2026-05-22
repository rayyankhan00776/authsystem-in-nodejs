import dotenv from "dotenv";
dotenv.config();

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is not defined in the environment variables");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not defined in the environment variables");
  process.exit(1);
}

if (!process.env.JWT_EXPIRES_IN) {
  console.error("JWT_EXPIRES_IN is not defined in the environment variables");
  process.exit(1);
}

if (!process.env.MODE) {
  console.error("MODE is not defined in the environment variables");
  process.exit(1);
}

export const config ={
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
    MODE: process.env.MODE
}

export default config;