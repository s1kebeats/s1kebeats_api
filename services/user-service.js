const PrismaClient = require('@prisma/client').PrismaClient;
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');

class UserService {
    async register(email, password) {
        const candidate = await prisma.user.findUnique({
            where: { email }
        })
        if (candidate) {
            throw new Error(`Пользователь с почтовым адресом ${email} уже зарегистрирован.`)
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
        await mailService.sendActivationMail(email, activationLink);

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {
            ...tokens,
            user: userDto,
        }
    }
}

module.exports = new UserService();