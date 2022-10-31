const jwt = require('jsonwebtoken');
const PrismaClient = require('@prisma/client').PrismaClient;
const prisma = new PrismaClient();

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
            expiresIn: '30m'
        });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: '30d'
        });
        return {
            accessToken,
            refreshToken
        };
    }
    async saveToken(userId, refreshToken) {
        // const token = await prisma.token.findUnique({
        //     where: {
        //         userId
        //     }
        // })
        // if (token) {
        //     return await prisma.token.update({
        //         where: {
        //             userId
        //         },
        //         data: {
        //             refreshToken
        //         }
        //     })
        // }
        return await prisma.token.upsert({
            where: {
                userId
            },
            update: {
                refreshToken
            },
            create: {
                userId,
                refreshToken
            }
        });
    }
}
module.exports = new TokenService();