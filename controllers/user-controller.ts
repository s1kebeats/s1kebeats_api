import userService from '../services/user-service.js';
import ApiError from '../exceptions/api-error.js';
import { Request, Response, NextFunction } from 'express';
import PrismaClient from '@prisma/client';

class UserController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const payload: Pick<
                PrismaClient.Prisma.UserCreateInput,
                // activationLink is generated automatically, so we don't need to pass it in the payload
                'email' | 'username' | 'password'
            > = (({
                email,
                username,
                password,
            }: {
                [key: string]: string;
            }) => ({ email, username, password }))(req.body);
            await userService.register(payload);
            return res.json('success');
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                username,
                password,
            }: { username: string; password: string } = req.body;
            const userData = await userService.login(username, password);
            // set refresh token httpOnly cookie
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
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken }: { refreshToken: string } = req.cookies;
            if (!refreshToken) {
                return next(ApiError.UnauthorizedUser());
            }
            const token = await userService.logout(refreshToken);
            // remove cookie with refresh token
            res.clearCookie('resfreshToken');
            return res.json(token);
        } catch (error) {
            next(error);
        }
    }

    async activate(req: Request, res: Response, next: NextFunction) {
        try {
            const { activationLink } = req.params;
            await userService.activate(activationLink);
            return res.json('success');
        } catch (error) {
            next(error);
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken }: { refreshToken: string } = req.cookies;
            if (!refreshToken) {
                return next(ApiError.UnauthorizedUser());
            }
            const userData = await userService.refresh(refreshToken);
            // update refresh token cookie
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
    }

    async edit(req: Request, res: Response, next: NextFunction) {
        try {
            const payload: PrismaClient.Prisma.UserUpdateInput = (({
                displayedName,
                about,
                vk,
                youtube,
                instagram,
                image,
            }: {
                [key: string]: string;
            }) => ({ displayedName, about, vk, youtube, instagram, image }))(
                req.body
            );
            const userId = req.user!.id;

            await userService.edit(userId, payload);

            return res.json('success');
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();
