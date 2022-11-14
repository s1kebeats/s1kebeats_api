import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import router from './router/index.js';
import errorMiddleware from './middlewares/error-middleware.js';

dotenv.config();

const app = express();

app.use(fileUpload());
app.use(express.json({ limit: '1000mb' }));
app.use(
  cors({
    origin: 'http://example.com',
  })
);
app.use(cookieParser());
app.use('/api', router);
// error handler
app.use(errorMiddleware);

export default app;
