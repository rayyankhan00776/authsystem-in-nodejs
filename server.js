import config from "./src/configs/config.js";
import connectDB from "./src/db.js";
import app from "./src/app.js";

try {
  await connectDB();
  app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
  });
} catch {
  process.exit(1);
}