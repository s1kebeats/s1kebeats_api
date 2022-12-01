import PrismaClient from '@prisma/client';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

import UserDto from '../dtos/user-dto.js';
import mailService from './mail-service.js';
import tokenService from './token-service.js';
import ApiError from '../exceptions/api-error.js';
import fileService from './file-service.js';
import { UploadedFile } from 'express-fileupload';

const prisma = new PrismaClient.PrismaClient();

class UserService {
  // tokens and login/register dto generator
  async generateData(
    user: PrismaClient.User
  ): Promise<{ accessToken: string; refreshToken: string; user: UserDto }> {
    // remove confidentional information from user data
    const userDto = new UserDto(user);
    // generate tokens
    const tokens = tokenService.generateTokens(userDto);
    // save resfresh token in DB
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
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
      throw ApiError.BadRequest(`Username "${username}" is already taken.`);
    }
    userCandidateFindUniqueArgs = {
      where: { email },
    };
    candidate = await prisma.user.findUnique(userCandidateFindUniqueArgs);
    if (candidate) {
      throw ApiError.BadRequest(`Email "${email}" is already registered.`);
    }
    // hash password
    const hashedPassword: string = await bcrypt.hash(password, 3);
    // generate unique activation link
    const activationLink: string = nanoid(36);
    // create user data
    const userCreateArgs: PrismaClient.Prisma.UserCreateArgs = {
      data: {
        email,
        username,
        password: hashedPassword,
        activationLink,
      },
    };
    // create user
    const user: PrismaClient.User = await prisma.user.create(userCreateArgs);
    // send email with activation link
    await mailService.sendActivationMail(
      email,
      `${process.env.BASE_URL}/api/activate/${activationLink}`
    );
    // create tokens and user DTO
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
      throw ApiError.BadRequest('Wrong activation link.');
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
      throw ApiError.BadRequest('Wrong login credentials.');
    }
    // compare passwords
    const passwordEquals: boolean = await bcrypt.compare(
      password,
      user.password
    );
    if (!passwordEquals) {
      throw ApiError.BadRequest('Wrong login credentials.');
    }
    // create tokens and user DTO
    const data = await this.generateData(user);
    return data;
  }
  // logout
  async logout(refreshToken: string): Promise<PrismaClient.Token> {
    let token = await tokenService.findToken(refreshToken);
    if (!token) {
      throw ApiError.UnauthorizedUser();
    }
    // delete refresh token from db
    token = await tokenService.removeToken(refreshToken);
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
  async edit(
    userId: number,
    displayedName?: string,
    about?: string,
    vk?: string,
    youtube?: string,
    instagram?: string,
    image?: UploadedFile
  ) {
    // image aws upload
    let awsImage: string | undefined;
    if (image) {
      const awsImageObject = await fileService.awsUpload(image, 'image/');
      awsImage = awsImageObject.Key;
    }
    const userUpdateArgs: PrismaClient.Prisma.UserUpdateArgs = {
      where: {
        id: userId,
      },
      data: {
        image: awsImage,
        displayedName,
        about,
        vk,
        youtube,
        instagram,
      },
    };
    const user = await prisma.user.update(userUpdateArgs);
    return user;
  }
}

export default new UserService();
