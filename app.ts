import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import router from './router/index.js';
import errorMiddleware from './middlewares/error-middleware.js';
// env variables
dotenv.config();

const app = express();

app.use(fileUpload());
app.use(express.json({ limit: '1000mb' }));
app.use(cookieParser());
app.use('/api', router);
// errors middleware
app.use(errorMiddleware);

export default app;
