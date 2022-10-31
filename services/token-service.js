const jwt = require('jsonwebtoken');
const PrismaClient = require('@prisma/client').PrismaClient;
const prisma = new PrismaClient();

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
            expiresIn: '30m',
        });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: '30d',
        });
        return {
            accessToken,
            refreshToken,
        };
    }
    async saveToken(userId, refreshToken) {
        return await prisma.token.upsert({
            where: {
                userId,
            },
            update: {
                refreshToken,
            },
            create: {
                userId,
                refreshToken,
            },
        });
    }
    async removeToken(refreshToken) {
        const token = await prisma.token.delete({
            where: {
                refreshToken,
            },
        });
        return token;
    }
    async findToken(refreshToken) {
        const token = await prisma.token.findUnique({
            where: {
                refreshToken,
            },
        });
        return token;
    }
    validateAccessToken(accessToken) {
        try {
            const decoded = jwt.verify(
                accessToken,
                process.env.JWT_ACCESS_SECRET
            );
            return decoded;
        } catch (error) {
            return null;
        }
    }
    validateRefreshToken(refreshToken) {
        try {
            const decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET
            );
            return decoded;
        } catch (error) {
            return null;
        }
    }
}
module.exports = new TokenService();
