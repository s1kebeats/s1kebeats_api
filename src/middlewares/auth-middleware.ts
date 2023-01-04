import ApiError from "../exceptions/api-error";
import tokenService from "../services/token-service";
import { Request, Response, NextFunction } from "express";
import UserDto from "../dtos/user-dto";

export default async function (req: Request, res: Response, next: NextFunction) {
  try {
    // request authorization header with access token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      next(ApiError.UnauthorizedUser());
      return;
    }
    // 'Bearer ...token' split
    const accessToken = authHeader.split(" ")[1];
    if (!accessToken) {
      next(ApiError.UnauthorizedUser());
      return;
    }
    const userData = tokenService.validateAccessToken(accessToken) as UserDto;
    if (!userData) {
      next(ApiError.UnauthorizedUser());
      return;
    }
    req.user = userData;
    next();
  } catch (error) {
    next(ApiError.UnauthorizedUser());
  }
}
