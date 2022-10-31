const userService = require('../services/user-service');

class UserController {
    async register(req, res, next) {
        try {
            const { email, password } = req.body;
            const userData = await userService.register(email, password);
            res.cookie('resfreshToken', userData.resfreshToken, {
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
            
        } catch (error) {
            next(error)
        }
    }
    async logout(req, res, next) {
        try {
            
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
            
        } catch (error) {
            next(error)
        }
    }
    async getUsers(req, res, next) {
        try {
            res.json(['s1ke', 'beats'])
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new UserController();