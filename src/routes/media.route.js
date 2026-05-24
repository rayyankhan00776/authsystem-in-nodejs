import express from 'express';
import multer from "multer";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { postMedia, getMedia, getAllMedia, deleteMedia, deleteAllMedia } from "../controllers/media.controller.js";

const mediaRouter = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB
    },
});

/*
* mediaRouter.post('/post', postMedia);
*/
mediaRouter.post('/post', authMiddleware, upload.single("file"), postMedia);

/*
* mediaRouter.get('/get/:id', getMedia);
*/
mediaRouter.get('/get/:id', authMiddleware, getMedia);

/*
* mediaRouter.get('/get-all', getAllMedia);
*/
mediaRouter.get('/get-all', authMiddleware, getAllMedia);

/*
* mediaRouter.delete('/delete/:id', deleteMedia);
*/
mediaRouter.delete('/delete/:id', authMiddleware, deleteMedia);

/*
* mediaRouter.delete('/delete-all', deleteAllMedia);
*/
mediaRouter.delete('/delete-all', authMiddleware, deleteAllMedia);

export default mediaRouter;