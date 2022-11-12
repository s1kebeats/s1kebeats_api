import PrismaClient from '@prisma/client';
import bcrypt from 'bcrypt';
import uuid from 'uuid';

import UserDto from '../dtos/user-dto';
import mailService from './mail-service';
import tokenService from './token-service';
import ApiError from '../exceptions/api-error';

const prisma = new PrismaClient.PrismaClient();

class UserService {
  async generateData(user: PrismaClient.User): Promise<{ accessToken: string, refreshToken: string, user: UserDto }> {
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens(userDto);
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return {
      ...tokens,
      user: userDto,
    };
  }
  async register(email: string, username: string, password: string): Promise<{ accessToken: string, refreshToken: string, user: UserDto }> {
    let userCandidateFindUniqueArgs: PrismaClient.Prisma.UserFindUniqueArgs = {
      where: { username },
    }
    let candidate: PrismaClient.User | null = await prisma.user.findUnique(userCandidateFindUniqueArgs);
    if (candidate) {
      throw ApiError.BadRequest(`Имя пользователя ${username} занято`);
    }
    userCandidateFindUniqueArgs = {
      where: { email },
    }
    candidate = await prisma.user.findUnique(userCandidateFindUniqueArgs);
    if (candidate) {
      throw ApiError.BadRequest(
        `Пользователь с почтовым адресом ${email} уже зарегистрирован`
      );
    }
    const hashedPassword: string = await bcrypt.hash(password, 3);
    const activationLink: string = uuid.v4();
    const userCreateArgs: PrismaClient.Prisma.UserCreateArgs = {
      data: {
        email,
        username,
        password: hashedPassword,
        activationLink,
      },
    }
    const user: PrismaClient.User = await prisma.user.create(userCreateArgs);
    // sending email with activation link
    // await mailService.sendActivationMail(
    //     email,
    //     `${process.env.BASE_URL}/api/activate/${activationLink}`
    // );
    // generate tokens and DTO
    const data = await this.generateData(user);
    return data;
  }
  async activate(activationLink: string): Promise<PrismaClient.User> {
    const userFindUniqueArgs: PrismaClient.Prisma.UserFindUniqueArgs = {
      where: {
        activationLink,
      },
    }
    let user: PrismaClient.User | null = await prisma.user.findUnique(userFindUniqueArgs);
    if (!user) {
      throw ApiError.BadRequest('Ссылка для активации неккоректна');
    }
    const userUpdateArgs: PrismaClient.Prisma.UserUpdateArgs = {
      where: {
        activationLink,
      },
      data: {
        isActivated: true,
      },
    }
    user = await prisma.user.update(userUpdateArgs);
    return user;
  }
  async login(login: string, password: string): Promise<{ accessToken: string, refreshToken: string, user: UserDto }> {
    let user: PrismaClient.User | null ;
    if (login.includes('@')) {
      const userFindUniqueArgs: PrismaClient.Prisma.UserFindUniqueArgs = {
        where: { email: login },
      }
      user = await prisma.user.findUnique(userFindUniqueArgs);
    } else {
      const userFindUniqueArgs: PrismaClient.Prisma.UserFindUniqueArgs = {
        where: { username: login },
      }
      user = await prisma.user.findUnique(userFindUniqueArgs);
    }
    if (!user) {
      throw ApiError.BadRequest('Данные для входа недействительны');
    }
    const passwordEquals: boolean = await bcrypt.compare(password, user.password);
    if (!passwordEquals) {
      throw ApiError.BadRequest('Данные для входа недействительны');
    }
    // generate tokens and DTO
    const data = await this.generateData(user);
    return data;
  }
  async logout(refreshToken: string): Promise<PrismaClient.Token> {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }
  async refresh(refreshToken?: string) {
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
    const userFindUniqueArgs: PrismaClient.Prisma.UserFindUniqueArgs = {
      where: { id: userData.id },
    }
    const user = await prisma.user.findUnique(userFindUniqueArgs);
    // generate tokens and DTO
    const data = await this.generateData(user!);
    return data;
  }
}

module.exports = new UserService();
