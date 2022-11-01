const userService = require('../services/user-service');
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');

class UserController {
    async register(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(
                    ApiError.BadRequest('Ошибка валидации', errors.array())
                );
            }
            const { email, username, password } = req.body;
            const userData = await userService.register(email, username, password);
            // setting refresh token httpOnly cookie
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
    async login(req, res, next) {
        try {
            const { login, password } = req.body;
            const userData = await userService.login(login, password);
            // setting refresh token httpOnly cookie
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
    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('resfreshToken');
            return res.json(token);
        } catch (error) {
            next(error);
        }
    }
    async activate(req, res, next) {
        try {
            const { activationLink } = req.params;
            await userService.activate(activationLink);
            return res.redirect(process.env.BASE_URL);
        } catch (error) {
            next(error);
        }
    }
    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const userData = await userService.refresh(refreshToken);
            // updating refresh token cookie
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
}

module.exports = new UserController();
