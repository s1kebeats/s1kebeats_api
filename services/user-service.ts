import PrismaClient from '@prisma/client';
import bcrypt from 'bcrypt';
import uuid from 'uuid';

import UserDto from '../dtos/user-dto';
import mailService from './mail-service';
import tokenService from './token-service';
import ApiError from '../exceptions/api-error';

const prisma = new PrismaClient.PrismaClient();

class UserService {
  // tokens and login/register response generator
  async generateData(
    user: PrismaClient.User
  ): Promise<{ accessToken: string; refreshToken: string; user: UserDto }> {
    // remove confidentional information from user data
    const userDto = new UserDto(user);
    // generate access and refresh tokens
    const tokens = tokenService.generateTokens(userDto);
    // save the tokens to the database
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    // return data
    return {
      ...tokens,
      user: userDto,
    };
  }
  // new user registration
  async register(
    email: string,
    username: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string; user: UserDto }> {
    // check user email and username for uniqueness
    let userCandidateFindUniqueArgs: PrismaClient.Prisma.UserFindUniqueArgs = {
      where: { username },
    };
    let candidate: PrismaClient.User | null = await prisma.user.findUnique(
      userCandidateFindUniqueArgs
    );
    if (candidate) {
      throw ApiError.BadRequest(`Имя пользователя ${username} занято`);
    }
    userCandidateFindUniqueArgs = {
      where: { email },
    };
    candidate = await prisma.user.findUnique(userCandidateFindUniqueArgs);
    if (candidate) {
      throw ApiError.BadRequest(
        `Пользователь с почтовым адресом ${email} уже зарегистрирован`
      );
    }
    // hash user password
    const hashedPassword: string = await bcrypt.hash(password, 3);
    // generate unique activation link
    const activationLink: string = uuid.v4();
    // create user data
    const userCreateArgs: PrismaClient.Prisma.UserCreateArgs = {
      data: {
        email,
        username,
        password: hashedPassword,
        activationLink,
      },
    };
    // create user in the database
    const user: PrismaClient.User = await prisma.user.create(userCreateArgs);
    // sending email with activation link
    await mailService.sendActivationMail(
      email,
      `${process.env.BASE_URL}/api/activate/${activationLink}`
    );
    // generate tokens and form user DTO
    const data = await this.generateData(user);
    return data;
  }
  // account activation
  async activate(activationLink: string): Promise<PrismaClient.User> {
    // validate activation link
    const userFindUniqueArgs: PrismaClient.Prisma.UserFindUniqueArgs = {
      where: {
        activationLink,
      },
    };
    let user: PrismaClient.User | null = await prisma.user.findUnique(
      userFindUniqueArgs
    );
    if (!user) {
      throw ApiError.BadRequest('Ссылка для активации неккоректна');
    }
    // update user isActivated state to true
    const userUpdateArgs: PrismaClient.Prisma.UserUpdateArgs = {
      where: {
        activationLink,
      },
      data: {
        isActivated: true,
      },
    };
    user = await prisma.user.update(userUpdateArgs);
    return user;
  }
  // login user
  async login(
    login: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string; user: UserDto }> {
    let user: PrismaClient.User | null;
    // check if login is an email
    if (login.includes('@')) {
      // find user with given email
      const userFindUniqueArgs: PrismaClient.Prisma.UserFindUniqueArgs = {
        where: { email: login },
      };
      user = await prisma.user.findUnique(userFindUniqueArgs);
    } else {
      // login is an username, find user with given username
      const userFindUniqueArgs: PrismaClient.Prisma.UserFindUniqueArgs = {
        where: { username: login },
      };
      user = await prisma.user.findUnique(userFindUniqueArgs);
    }
    // if user wasn't found
    if (!user) {
      throw ApiError.BadRequest('Данные для входа недействительны');
    }
    // password compare
    const passwordEquals: boolean = await bcrypt.compare(
      password,
      user.password
    );
    if (!passwordEquals) {
      throw ApiError.BadRequest('Данные для входа недействительны');
    }
    // generate tokens and DTO
    const data = await this.generateData(user);
    return data;
  }
  // logout
  async logout(refreshToken: string): Promise<PrismaClient.Token> {
    // delete user's access and refresh tokens from database
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }
  // refresh access token
  async refresh(refreshToken?: string) {
    // if httpOnly cookie with refresh token wasn't provided
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
    // find user
    const userFindUniqueArgs: PrismaClient.Prisma.UserFindUniqueArgs = {
      where: { id: userData.id },
    };
    const user = await prisma.user.findUnique(userFindUniqueArgs);
    // re-generate tokens and DTO
    const data = await this.generateData(user!);
    return data;
  }
}

module.exports = new UserService();
