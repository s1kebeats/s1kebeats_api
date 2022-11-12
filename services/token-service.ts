import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import PrismaClient from '@prisma/client';
import UserDto from '../dtos/user-dto';

const prisma = new PrismaClient.PrismaClient();

class TokenService {
  generateTokens(payload: UserDto): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = jsonwebtoken.sign(
      payload,
      process.env.JWT_ACCESS_SECRET!,
      {
        expiresIn: '30m',
      }
    );
    const refreshToken = jsonwebtoken.sign(
      payload,
      process.env.JWT_REFRESH_SECRET!,
      {
        expiresIn: '30d',
      }
    );
    return {
      accessToken,
      refreshToken,
    };
  }
  async saveToken(
    userId: number,
    refreshToken: string
  ): Promise<PrismaClient.Token> {
    const tokenUpsertArgs: PrismaClient.Prisma.TokenUpsertArgs = {
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
    };
    const token = await prisma.token.upsert(tokenUpsertArgs);
    return token;
  }
  async removeToken(refreshToken: string): Promise<PrismaClient.Token> {
    const tokenDeleteArgs: PrismaClient.Prisma.TokenDeleteArgs = {
      where: {
        refreshToken,
      },
    };
    const token = await prisma.token.delete(tokenDeleteArgs);
    return token;
  }
  async findToken(refreshToken: string): Promise<PrismaClient.Token | null> {
    const tokenFindUniqueArgs: PrismaClient.Prisma.TokenFindUniqueArgs = {
      where: {
        refreshToken,
      },
    };
    const token = await prisma.token.findUnique(tokenFindUniqueArgs);
    return token;
  }
  validateAccessToken(accessToken: string): string | null | JwtPayload {
    try {
      const decoded = jsonwebtoken.verify(
        accessToken,
        process.env.JWT_ACCESS_SECRET!
      );
      return decoded;
    } catch (error) {
      return null;
    }
  }
  validateRefreshToken(refreshToken: string): null | JwtPayload {
    try {
      const decoded = jsonwebtoken.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as JwtPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }
}
export default new TokenService();
