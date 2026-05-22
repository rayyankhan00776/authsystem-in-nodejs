import express from 'express';
import { consoleLogger, fileLogger } from './middlewares/morgan.middleware.js';
import connectDB from './db.js';
import authRouter from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
const app = express();

app.use(express.json());

app.use(cookieParser());
app.use(consoleLogger);
app.use(fileLogger);

connectDB();

app.use('/api/auth', authRouter);

export default app;