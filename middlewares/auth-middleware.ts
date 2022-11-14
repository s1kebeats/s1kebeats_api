import ApiError from '../exceptions/api-error.js';
import tokenService from '../services/token-service.js';
import { Request, Response, NextFunction } from 'express';
import UserDto from '../dtos/user-dto.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserDto;
  }
}

export default async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // request authorization header with access token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(ApiError.UnauthorizedUser());
    }
    // 'Bearer ...token' split
    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
      return next(ApiError.UnauthorizedUser());
    }
    const userData = tokenService.validateAccessToken(accessToken) as UserDto;
    if (!userData) {
      return next(ApiError.UnauthorizedUser());
    }
    req.user = userData;
    next();
  } catch (error) {
    return next(ApiError.UnauthorizedUser());
  }
}
