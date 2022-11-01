const userService = require('../services/user-service');

class AuthorController {
    async getAuthors(req, res, next) {
        try {
            let users;
            if (req.query.q) {
                users = await userService.findAuthors(req.query.q);
            } else {
                users = await userService.getAuthors();
            }
            return res.json(users);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthorController();