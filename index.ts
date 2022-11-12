import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import router from './router';
import errorMiddleware from './middlewares/error-middleware';

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

const start = async () => {
  try {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Listening on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
