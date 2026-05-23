import express from 'express';
import { register, login, getME, refreshToken, logout, logoutAll } from '../controllers/auth.controller.js';

const authRouter = express.Router();

/*
* authRouter.post('/register',);
*/
authRouter.post('/register', register);

/*
* authRouter.post('/login', login);
*/
authRouter.post('/login', login);

/*
* authRouter.get('/get-me',);
*/
authRouter.get('/get-me', getME);

/*
* authRouter.get('/refresh-token', refreshToken);
*/
authRouter.get('/refresh-token', refreshToken);

/*
* authRouter.get('/logout', logout);
*/
authRouter.get('/logout', logout);
/*
* authRouter.get('/logout-all', logoutAll);
*/
authRouter.get('/logout-all', logoutAll);




export default authRouter;