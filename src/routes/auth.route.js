import express from 'express';
import { register , getME } from '../controllers/auth.controller.js';

const authRouter = express.Router();

/*
* authRouter.post('/register',);
*/
authRouter.post('/register', register);

authRouter.get('/get-me', getME);

export default authRouter;