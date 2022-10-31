const userService = require('../services/user-service');
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');

class UserController {
    async register(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка валидации', errors.array()))
            }
            const { email, password } = req.body;
            const userData = await userService.register(email, password);
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 30*24*60*1000, httpOnly: true, 
                secure: process.env.NODE_ENV === 'production',
            });
            return res.json(userData);
        } catch (error) {
            next(error)
        }
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const userData = await userService.login(email, password);
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 30*24*60*1000, httpOnly: true, 
                secure: process.env.NODE_ENV === 'production',
            });
            return res.json(userData);
        } catch (error) {
            next(error)
        }
    }
    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('resfreshToken');
            return res.json(token);
        } catch (error) {
            next(error)
        }
    }
    async activate(req, res, next) {
        try {
            const { activationLink } = req.params;
            await userService.activate(activationLink);
            return res.redirect(process.env.BASE_URL);
        } catch (error) {
            next(error)
        }
    }
    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 30*24*60*1000, httpOnly: true, 
                secure: process.env.NODE_ENV === 'production',
            });
            return res.json(userData);
        } catch (error) {
            next(error)
        }
    }
    async getUsers(req, res, next) {
        try {
            const users = await userService.getUsers();
            return res.json(users);
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new UserController();