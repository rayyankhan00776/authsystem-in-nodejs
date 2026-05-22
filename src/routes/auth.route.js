import express from 'express';
import { register } from '../controllers/auth.controller.js';

const authRouter = express.Router();

/*
* authRouter.post('/register',);
*/
authRouter.post('/register', register);

export default authRouter;