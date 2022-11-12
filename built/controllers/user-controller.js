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
const userService = require('../services/user-service');
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');
class UserController {
  register(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return next(ApiError.BadRequest('Ошибка валидации', errors.array()));
        }
        const { email, username, password } = req.body;
        const userData = yield userService.register(email, username, password);
        // setting refresh token httpOnly cookie
        res.cookie('refreshToken', userData.refreshToken, {
          // 30 days
          maxAge: 30 * 24 * 60 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        });
        return res.json(userData);
      } catch (error) {
        next(error);
      }
    });
  }
  login(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const { login, password } = req.body;
        const userData = yield userService.login(login, password);
        // setting refresh token httpOnly cookie
        res.cookie('refreshToken', userData.refreshToken, {
          // 30 days
          maxAge: 30 * 24 * 60 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        });
        return res.json(userData);
      } catch (error) {
        next(error);
      }
    });
  }
  logout(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const { refreshToken } = req.cookies;
        const token = yield userService.logout(refreshToken);
        res.clearCookie('resfreshToken');
        return res.json(token);
      } catch (error) {
        next(error);
      }
    });
  }
  activate(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const { activationLink } = req.params;
        yield userService.activate(activationLink);
        return res.redirect(process.env.BASE_URL);
      } catch (error) {
        next(error);
      }
    });
  }
  refresh(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const { refreshToken } = req.cookies;
        const userData = yield userService.refresh(refreshToken);
        // updating refresh token cookie
        res.cookie('refreshToken', userData.refreshToken, {
          // 30 days
          maxAge: 30 * 24 * 60 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        });
        return res.json(userData);
      } catch (error) {
        next(error);
      }
    });
  }
}
module.exports = new UserController();
