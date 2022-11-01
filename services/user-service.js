const PrismaClient = require('@prisma/client').PrismaClient;
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');

class UserService {
  async generateData(user) {
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return {
      ...tokens,
      user: userDto,
    };
  }
  async register(email, username, password) {
    let candidate = await prisma.user.findUnique({
      where: { username },
    });
    if (candidate) {
      throw ApiError.BadRequest(`Имя пользователя ${username} занято`);
    }
    candidate = await prisma.user.findUnique({
      where: { email },
    });
    if (candidate) {
      throw ApiError.BadRequest(
        `Пользователь с почтовым адресом ${email} уже зарегистрирован`
      );
    }
    const hashedPassword = await bcrypt.hash(password, 3);
    const activationLink = uuid.v4();
    const user = await prisma.user.create({
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
    const data = await this.generateData(user);
    return data;
  }
  async activate(activationLink) {
    const user = await prisma.user.findUnique({
      where: {
        activationLink,
      },
    });
    if (!user) {
      throw ApiError.BadRequest('Ссылка для активации неккоректна');
    }
    return await prisma.user.update({
      where: {
        activationLink,
      },
      data: {
        isActivated: true,
      },
    });
  }
  async login(login, password) {
    let user;
    if (login.includes('@')) {
      user = await prisma.user.findUnique({
        where: { email: login },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { username: login },
      });
    }
    if (!user) {
      throw ApiError.BadRequest('Данные для входа недействительны');
    }
    const passwordEquals = await bcrypt.compare(password, user.password);
    if (!passwordEquals) {
      throw ApiError.BadRequest('Данные для входа недействительны');
    }
    // generate tokens and DTO
    const data = await this.generateData(user);
    return data;
  }
  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }
  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedUser();
    }
    // user data decoded from refresh token
    const userData = tokenService.validateRefreshToken(refreshToken);
    // check if token is in database
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedUser();
    }
    const user = await prisma.user.findUnique({
      where: { id: userData.id },
    });
    // generate tokens and DTO
    const data = await this.generateData(user);
    return data;
  }
}

module.exports = new UserService();
