import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import PrismaClient from '@prisma/client';
import UserDto from '../dtos/user-dto.js';

const prisma = new PrismaClient.PrismaClient();

class TokenService {
  generateTokens(payload: UserDto): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = jsonwebtoken.sign(Object.assign({}, payload), process.env.JWT_ACCESS_SECRET!, {
      expiresIn: '30m',
    });
    const refreshToken = jsonwebtoken.sign(Object.assign({}, payload), process.env.JWT_REFRESH_SECRET!, {
      expiresIn: '30d',
    });
    return {
      accessToken,
      refreshToken,
    };
  }
  async saveToken(userId: number, ip: string, refreshToken: string): Promise<PrismaClient.Token> {
    // update existing refresh token or create new token
    const tokenUpsertArgs: PrismaClient.Prisma.TokenUpsertArgs = {
      where: {
        ip,
      },
      update: {
        refreshToken,
      },
      create: {
        ip,
        userId,
        refreshToken,
      },
    };
    const token = await prisma.token.upsert(tokenUpsertArgs);
    return token;
  }
  // remove token for user logout
  async removeToken(ip: string): Promise<PrismaClient.Token> {
    const tokenDeleteArgs: PrismaClient.Prisma.TokenDeleteArgs = {
      where: {
        ip,
      },
    };
    const token = await prisma.token.delete(tokenDeleteArgs);
    return token;
  }
  // check for token existence
  async findToken(refreshToken: string, ip: string): Promise<PrismaClient.Token | null> {
    const tokenFindUniqueArgs: PrismaClient.Prisma.TokenFindUniqueArgs = {
      where: {
        refreshToken,
        ip,
      },
    };
    const token = await prisma.token.findUnique(tokenFindUniqueArgs);
    return token;
  }
  // decode data from given tokens
  validateAccessToken(accessToken: string): null | JwtPayload {
    try {
      const decoded = jsonwebtoken.verify(accessToken, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
      // return user data
      return decoded;
    } catch (error) {
      return null;
    }
  }
  validateRefreshToken(refreshToken: string): null | JwtPayload {
    try {
      const decoded = jsonwebtoken.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
      // return user data
      return decoded;
    } catch (error) {
      return null;
    }
  }
}
export default new TokenService();
