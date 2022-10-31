const PrismaClient = require('@prisma/client').PrismaClient;
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');

class UserService {
    async register(email, password) {
        const candidate = await prisma.user.findUnique({
            where: { email }
        })
        if (candidate) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже зарегистрирован.`)
        }
        const hashedPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4()
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                activationLink
            },
        });
        await mailService.sendActivationMail(email, `${process.env.BASE_URL}/api/activate/${activationLink}`);

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {
            ...tokens,
            user: userDto,
        }
    }
    async activate(activationLink) {
        const user = await prisma.user.findUnique({
            where: {
                activationLink
            }
        })
        if (!user) {
            throw ApiError.BadRequest('Ссылка для активации неккоректна')
        }
        return await prisma.user.update({
            where: {
                activationLink
            },
            data: {
                isActivated: true
            }
        })
    }
}

module.exports = new UserService();