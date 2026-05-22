import morgan from "morgan";
import fs from "fs";
import path from "path";

const logsDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const accessLogStream = fs.createWriteStream(
  path.join(logsDir, "access.log"),
  { flags: "a" }
);

// Save logs to file
export const fileLogger = morgan("combined", {
  stream: accessLogStream,
});

// Show logs in terminal
export const consoleLogger = morgan("dev");