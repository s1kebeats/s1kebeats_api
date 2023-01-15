import jsonwebtoken, { JwtPayload } from 'jsonwebtoken'
import PrismaClient from '@prisma/client'
import UserDto from '../dtos/user-dto'

const prisma = new PrismaClient.PrismaClient()

class TokenService {
  generateTokens (
    payload: UserDto,
    refresh: boolean
  ): {
      accessToken: string
      refreshToken?: string
    } {
    const tokens: {
      accessToken: string
      refreshToken?: string
    } = {
      accessToken: jsonwebtoken.sign(Object.assign({}, payload), process.env.JWT_ACCESS_SECRET!, {
        expiresIn: '15m'
      })
    }
    if (refresh) {
      tokens.refreshToken = jsonwebtoken.sign(Object.assign({}, payload), process.env.JWT_REFRESH_SECRET!, {
        expiresIn: '30d'
      })
    }

    return tokens
  }

  async saveToken (userId: number, ip: string, refreshToken: string): Promise<PrismaClient.Token> {
    // update existing refresh token or create new token
    const tokenUpsertArgs: PrismaClient.Prisma.TokenUpsertArgs = {
      where: {
        ip
      },
      update: {
        refreshToken
      },
      create: {
        ip,
        refreshToken,
        user: {
          connect: { id: userId }
        }
      }
    }
    const token = await prisma.token.upsert(tokenUpsertArgs)
    return token
  }

  // remove token for user logout
  async removeToken (ip: string): Promise<PrismaClient.Token> {
    const tokenDeleteArgs: PrismaClient.Prisma.TokenDeleteArgs = {
      where: {
        ip
      }
    }
    const token = await prisma.token.delete(tokenDeleteArgs)
    return token
  }

  // check for token existence
  async findToken (refreshToken: string): Promise<PrismaClient.Token | null> {
    const token = await prisma.token.findUnique({
      where: {
        refreshToken
      }
    })
    return token
  }

  // decode data from given tokens
  validateAccessToken (accessToken: string): null | JwtPayload {
    try {
      const decoded = jsonwebtoken.verify(accessToken, process.env.JWT_ACCESS_SECRET!) as JwtPayload
      // return user data
      return decoded
    } catch (error) {
      return null
    }
  }

  validateRefreshToken (refreshToken: string): null | JwtPayload {
    try {
      const decoded = jsonwebtoken.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as JwtPayload
      // return user data
      return decoded
    } catch (error) {
      return null
    }
  }
}
export default new TokenService()
