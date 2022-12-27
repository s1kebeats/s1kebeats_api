import PrismaClient from '@prisma/client';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import sharp from 'sharp';

import UserDto from '../dtos/user-dto.js';
import mailService from './mail-service.js';
import tokenService from './token-service.js';
import ApiError from '../exceptions/api-error.js';

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

    async register({
        email,
        username,
        password,
    }: Pick<
        PrismaClient.Prisma.UserCreateInput,
        'email' | 'username' | 'password'
    >): Promise<void> {
        // check if username is already registered
        const existingUser: PrismaClient.User | null =
            await prisma.user.findUnique({
                where: { username },
            });
        if (existingUser) {
            throw ApiError.BadRequest(
                `Username "${username}" is already taken.`
            );
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
        await mailService.sendActivationMail(
            email,
            `${process.env.BASE_URL}/api/activate/${activationLink}`
        );
    }

    async activate(activationLink: string): Promise<void> {
        // validate activation link
        let user: PrismaClient.User | null = await prisma.user.findUnique({
            where: {
                activationLink,
            },
        });
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
        await prisma.user.update(userUpdateArgs);
    }

    async login(
        username: string,
        password: string
    ): Promise<{ accessToken: string; refreshToken: string; user: UserDto }> {
        let user: PrismaClient.User | null;
        user = await prisma.user.findUnique({
            where: { username },
        });
        if (!user) {
            throw ApiError.UnauthorizedUser();
        }
        if (!user.isActivated) {
            throw ApiError.NotActivatedEmail();
        }
        // compare passwords
        const passwordEquals: boolean = await bcrypt.compare(
            password,
            user.password
        );
        if (!passwordEquals) {
            throw ApiError.UnauthorizedUser();
        }
        // create tokens and user DTO
        const data = await this.generateData(user);
        return data;
    }

    async logout(refreshToken: string): Promise<void> {
        let token = await tokenService.findToken(refreshToken);
        if (!token) {
            throw ApiError.UnauthorizedUser();
        }
        // delete refresh token
        await tokenService.removeToken(refreshToken);
    }

    async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; user: UserDto }> {
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
        payload: PrismaClient.Prisma.UserUpdateInput
    ): Promise<void> {
        const userUpdateArgs: PrismaClient.Prisma.UserUpdateArgs = {
            where: { id: userId },
            data: payload,
        };
        await prisma.user.update(userUpdateArgs);
    }
}

export default new UserService();
