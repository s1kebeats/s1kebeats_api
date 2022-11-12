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
const PrismaClient = require('@prisma/client').PrismaClient;
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');
class UserService {
  generateData(user) {
    return __awaiter(this, void 0, void 0, function* () {
      const userDto = new UserDto(user);
      const tokens = tokenService.generateTokens(Object.assign({}, userDto));
      yield tokenService.saveToken(userDto.id, tokens.refreshToken);
      return Object.assign(Object.assign({}, tokens), { user: userDto });
    });
  }
  register(email, username, password) {
    return __awaiter(this, void 0, void 0, function* () {
      let candidate = yield prisma.user.findUnique({
        where: { username },
      });
      if (candidate) {
        throw ApiError.BadRequest(`Имя пользователя ${username} занято`);
      }
      candidate = yield prisma.user.findUnique({
        where: { email },
      });
      if (candidate) {
        throw ApiError.BadRequest(
          `Пользователь с почтовым адресом ${email} уже зарегистрирован`
        );
      }
      const hashedPassword = yield bcrypt.hash(password, 3);
      const activationLink = uuid.v4();
      const user = yield prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          activationLink,
        },
      });
      // sending email with activation link
      // await mailService.sendActivationMail(
      //     email,
      //     `${process.env.BASE_URL}/api/activate/${activationLink}`
      // );
      // generate tokens and DTO
      const data = yield this.generateData(user);
      return data;
    });
  }
  activate(activationLink) {
    return __awaiter(this, void 0, void 0, function* () {
      const user = yield prisma.user.findUnique({
        where: {
          activationLink,
        },
      });
      if (!user) {
        throw ApiError.BadRequest('Ссылка для активации неккоректна');
      }
      return yield prisma.user.update({
        where: {
          activationLink,
        },
        data: {
          isActivated: true,
        },
      });
    });
  }
  login(login, password) {
    return __awaiter(this, void 0, void 0, function* () {
      let user;
      if (login.includes('@')) {
        user = yield prisma.user.findUnique({
          where: { email: login },
        });
      } else {
        user = yield prisma.user.findUnique({
          where: { username: login },
        });
      }
      if (!user) {
        throw ApiError.BadRequest('Данные для входа недействительны');
      }
      const passwordEquals = yield bcrypt.compare(password, user.password);
      if (!passwordEquals) {
        throw ApiError.BadRequest('Данные для входа недействительны');
      }
      // generate tokens and DTO
      const data = yield this.generateData(user);
      return data;
    });
  }
  logout(refreshToken) {
    return __awaiter(this, void 0, void 0, function* () {
      const token = yield tokenService.removeToken(refreshToken);
      return token;
    });
  }
  refresh(refreshToken) {
    return __awaiter(this, void 0, void 0, function* () {
      if (!refreshToken) {
        throw ApiError.UnauthorizedUser();
      }
      // user data decoded from refresh token
      const userData = tokenService.validateRefreshToken(refreshToken);
      // check if token is in database
      const tokenFromDb = yield tokenService.findToken(refreshToken);
      if (!userData || !tokenFromDb) {
        throw ApiError.UnauthorizedUser();
      }
      const user = yield prisma.user.findUnique({
        where: { id: userData.id },
      });
      // generate tokens and DTO
      const data = yield this.generateData(user);
      return data;
    });
  }
}
module.exports = new UserService();
