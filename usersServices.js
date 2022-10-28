const PrismaClient = require('@prisma/client').PrismaClient;
const prisma = new PrismaClient();

const findUserById = (id) => {
    prisma.user.findUnique({
        where: {
            id
        }
    })
}

module.exports = {findUserById};