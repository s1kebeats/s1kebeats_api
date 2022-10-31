const ApiError = require('../exceptions/api-error');
const tokenService = require('../services/token-service');

module.exports = async function (req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return next(ApiError.UnauthorizedUser());
        }
        const accessToken = authHeader.split(' ')[1];
        if (!accessToken) {
            return next(ApiError.UnauthorizedUser());
        }
        const userData = tokenService.validateAccessToken(accessToken);
        if (!userData) {
            return next(ApiError.UnauthorizedUser());
        }
        req.user = userData;
        next();
    } catch (error) {
        return next(ApiError.UnauthorizedUser());
    }
};
