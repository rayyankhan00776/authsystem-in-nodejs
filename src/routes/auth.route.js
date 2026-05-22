import express from 'express';
import { register, getME, refreshToken } from '../controllers/auth.controller.js';

const authRouter = express.Router();

/*
* authRouter.post('/register',);
*/
authRouter.post('/register', register);

authRouter.get('/get-me', getME);
authRouter.get('/refresh-token', refreshToken);

export default authRouter;