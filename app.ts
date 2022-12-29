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

app.set('trust proxy', true);

// app.use((req, res, next) => {
//   console.log(req.get('origin'));
//   next();
// });

app.use(fileUpload());
app.use(express.json({ limit: '1000mb' }));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    // nuxt server url
    origin: process.env.CLIENT_URL,
  })
);

// router
app.use('/api', router);

app.use(errorMiddleware);

export default app;
