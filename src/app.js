import express from 'express';
import cookieParser from 'cookie-parser';
import { consoleLogger, fileLogger } from './middlewares/morgan.middleware.js';
import authRouter from './routes/auth.route.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(consoleLogger);
app.use(fileLogger);

app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
    res.send('Welcome to the Auth System API');
});

export default app;