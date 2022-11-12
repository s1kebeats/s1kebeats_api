require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

const router = require('./router/index');
const errorMiddleware = require('./middlewares/error-middleware');

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
