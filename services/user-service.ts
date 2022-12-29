import PrismaClient from "@prisma/client";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

import UserDto from "../dtos/user-dto.js";
import mailService from "./mail-service.js";
import tokenService from "./token-service.js";
import ApiError from "../exceptions/api-error.js";
import AuthResponse from "../models/AuthResponse.js";

const prisma = new PrismaClient.PrismaClient();

class UserService {
  // tokens and login/register dto generator
  async generateData(user: PrismaClient.User, ip: string): Promise<AuthResponse> {
    // remove confidentional information from user data
    const userDto = new UserDto(user);
    // generate tokens
    const tokens = tokenService.generateTokens(userDto);
    // save resfresh token in DB
    await tokenService.saveToken(userDto.id, ip, tokens.refreshToken);
    return {
      ...tokens,
      user: userDto,
    };
  }

  async register({
    email,
    username,
    password,
  }: Pick<PrismaClient.Prisma.UserCreateInput, "email" | "username" | "password">): Promise<void> {
    // check if username is already registered
    const existingUser: PrismaClient.User | null = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUser) {
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
    await prisma.user.create(userCreateArgs);
    // send email with activation link
    await mailService.sendActivationMail(email, `${process.env.BASE_URL}/api/activate/${activationLink}`);
  }

  async activate(activationLink: string): Promise<void> {
    // validate activation link
    let user = await prisma.user.findUnique({
      where: {
        activationLink,
      },
    });
    if (!user) {
      throw ApiError.BadRequest("Wrong activation link.");
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

  async login(username: string, password: string, ip: string): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      throw ApiError.UnauthorizedUser();
    }
    if (!user.isActivated) {
      throw ApiError.NotActivatedEmail();
    }
    // compare passwords
    const passwordEquals: boolean = await bcrypt.compare(password, user.password);
    if (!passwordEquals) {
      throw ApiError.UnauthorizedUser();
    }
    // create tokens and user DTO
    const data = await this.generateData(user, ip);
    return data;
  }

  async logout(refreshToken: string, ip: string): Promise<void> {
    const token = await tokenService.findToken(refreshToken, ip);
    if (!token) {
      throw ApiError.UnauthorizedUser();
    }
    // delete refresh token
    await tokenService.removeToken(ip);
  }

  async refresh(refreshToken: string, ip: string): Promise<AuthResponse> {
    // user data decoded from refresh token
    const userData = tokenService.validateRefreshToken(refreshToken);
    // check if token is in database
    const tokenFromDb = await tokenService.findToken(refreshToken, ip);
    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedUser();
    }
    // find user
    const user = await prisma.user.findUnique({
      where: { id: userData.id },
    });
    // re-generate tokens and DTO
    const data = await this.generateData(user!, ip);
    return data;
  }

  async edit(userId: number, payload: PrismaClient.Prisma.UserUpdateInput): Promise<void> {
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
    if (!user) {
      throw ApiError.NotFound(`User was not found.`);
    }
    return user;
  }
}

export default new UserService();
