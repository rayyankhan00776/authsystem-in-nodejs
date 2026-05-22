import express from 'express';
import { consoleLogger, fileLogger } from './middlewares/morgan.middleware.js';
import connectDB from './db.js';
import authRouter from './routes/auth.route.js';

const app = express();

app.use(express.json());

app.use(consoleLogger);
app.use(fileLogger);

connectDB();

app.use('/api/auth', authRouter);

export default app;