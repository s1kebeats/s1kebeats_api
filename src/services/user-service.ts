import PrismaClient from "@prisma/client";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

import UserDto from "../dtos/user-dto";
import mailService from "./mail-service";
import tokenService from "./token-service";
import ApiError from "../exceptions/api-error";
import AuthResponse from "../models/AuthResponse";

const prisma = new PrismaClient.PrismaClient();

class UserService {
  // tokens and login/register dto generator
  async generateData(user: PrismaClient.User, ip: string, refresh: boolean): Promise<AuthResponse> {
    // remove confidentional information from user data
    const userDto = new UserDto(user);
    // generate tokens
    const tokens = tokenService.generateTokens(userDto, refresh);
    // save resfresh token in DB
    if (tokens.refreshToken) {
      await tokenService.saveToken(userDto.id, ip, tokens.refreshToken);
    }
    return {
      ...tokens,
      user: userDto,
    };
  }

  async register({
    email,
    username,
    password,
  }: Pick<PrismaClient.Prisma.UserCreateInput, "email" | "username" | "password">): Promise<UserDto> {
    // check if username is already registered
    const existingUser: PrismaClient.User | null = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUser != null) {
      throw ApiError.BadRequest(`Username "${username}" is already taken.`);
    }
    // hash password
    const hashedPassword: string = await bcrypt.hash(password, 3);
    // generate unique activation link
    const activationLink: string = nanoid(64);
    const userCreateArgs: PrismaClient.Prisma.UserCreateArgs = {
      data: {
        email,
        username,
        password: hashedPassword,
        activationLink,
      },
    };
    const user = await prisma.user.create(userCreateArgs);
    // send email with activation link
    await mailService.sendActivationMail(email, `${process.env.BASE_URL!}/api/activate/${activationLink}`);
    const userDto = new UserDto(user);
    return userDto;
  }

  async activate(activationLink: string): Promise<void> {
    // validate activation link
    const user = await prisma.user.findUnique({
      where: {
        activationLink,
      },
    });
    if (user == null) {
      throw ApiError.NotFound("Wrong activation link.");
    }
    // update user isActivated state to true
    await prisma.user.update({
      where: {
        activationLink,
      },
      data: {
        isActivated: true,
      },
    });
  }

  async login(username: string, password: string, ip: string, refresh: boolean): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (user == null) {
      throw ApiError.UnauthorizedUser();
    }
    // compare passwords
    const passwordEquals: boolean = await bcrypt.compare(password, user.password);
    if (!passwordEquals) {
      throw ApiError.UnauthorizedUser();
    }
    if (!user.isActivated) {
      throw ApiError.NotActivatedEmail();
    }
    // create tokens and user DTO
    const data = await this.generateData(user, ip, refresh);
    return data;
  }

  async logout(refreshToken: string, ip: string): Promise<void> {
    const token = await tokenService.findToken(refreshToken);
    if (token == null || token.ip !== ip) {
      throw ApiError.UnauthorizedUser();
    }
    // delete refresh token
    await tokenService.removeToken(ip);
  }

  async refresh(refreshToken: string, ip: string): Promise<AuthResponse> {
    // user data decoded from refresh token
    const userData = tokenService.validateRefreshToken(refreshToken);
    // check if token is in database
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (userData == null || tokenFromDb == null || tokenFromDb.ip !== ip) {
      throw ApiError.UnauthorizedUser();
    }
    // find user
    const user = await prisma.user.findUnique({
      where: { id: userData.id },
    });
    // re-generate tokens and DTO
    const data = await this.generateData(user!, ip, true);
    return data;
  }

  async edit(userId: number, payload: PrismaClient.Prisma.UserUpdateInput): Promise<void> {
    if (payload.username) {
      // check if username isn't already registered
      const existingUser: PrismaClient.User | null = await prisma.user.findUnique({
        where: { username: payload.username as string },
      });
      if (existingUser != null) {
        throw ApiError.BadRequest(`Username "${payload.username as string}" is already taken.`);
      }
    }
    const userUpdateArgs: PrismaClient.Prisma.UserUpdateArgs = {
      where: { id: userId },
      data: payload,
    };
    await prisma.user.update(userUpdateArgs);
  }

  async getUserById(id: number): Promise<PrismaClient.User> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (user == null) {
      throw ApiError.NotFound("User was not found.");
    }
    return user;
  }
}

export default new UserService();
