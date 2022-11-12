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
const ApiError = require('../exceptions/api-error');
const tokenService = require('../services/token-service');
module.exports = function (req, res, next) {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return next(ApiError.UnauthorizedUser());
      }
      const accessToken = authHeader.split(' ')[1];
      if (!accessToken) {
        return next(ApiError.UnauthorizedUser());
      }
      const userData = tokenService.validateAccessToken(accessToken);
      if (!userData) {
        return next(ApiError.UnauthorizedUser());
      }
      req.user = userData;
      next();
    } catch (error) {
      return next(ApiError.UnauthorizedUser());
    }
  });
};
