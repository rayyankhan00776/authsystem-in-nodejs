import express from 'express';
import morgan from 'morgan';
import connectDB from './db.js';
import authRouter from './routes/auth.route.js';

const app = express();

app.use(express.json());

app.use(morgan('dev'));

connectDB();

app.use('/api/auth', authRouter)

export default app;