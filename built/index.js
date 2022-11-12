'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
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
const start = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      app.listen(process.env.PORT || 5000, () => {
        console.log(`Listening on port ${process.env.PORT}`);
      });
    } catch (error) {
      console.log(error);
    }
  });
start();
