import userService from '../services/user-service';
import { validationResult } from 'express-validator';
import ApiError from '../exceptions/api-error';
import { Request, Response, NextFunction } from 'express';

class UserController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      // expresss validator errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка валидации', errors.array()));
      }
      // registration data
      const {
        email,
        username,
        password,
      }: { email: string; username: string; password: string } = req.body;
      // register the user
      const userData = await userService.register(email, username, password);
      // setting refresh token httpOnly cookie
      res.cookie('refreshToken', userData.refreshToken, {
        // 30 days
        maxAge: 30 * 24 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
      return res.json(userData);
    } catch (error) {
      next(error);
    }
  }
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      // login data
      const { login, password }: { login: string; password: string } = req.body;
      // login the user
      const userData = await userService.login(login, password);
      // setting refresh token httpOnly cookie
      res.cookie('refreshToken', userData.refreshToken, {
        // 30 days
        maxAge: 30 * 24 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
      return res.json(userData);
    } catch (error) {
      next(error);
    }
  }
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken }: { refreshToken: string } = req.cookies;
      const token = await userService.logout(refreshToken);
      // remove cookie with refresh token
      res.clearCookie('resfreshToken');
      return res.json(token);
    } catch (error) {
      next(error);
    }
  }
  // user activation
  async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const { activationLink } = req.params;
      await userService.activate(activationLink);
      // redirect to the main page
      return res.redirect(process.env.BASE_URL!);
    } catch (error) {
      next(error);
    }
  }
  // refresh user's tokens
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken }: { refreshToken: string } = req.cookies;
      const userData = await userService.refresh(refreshToken);
      // updating refresh token cookie
      res.cookie('refreshToken', userData.refreshToken, {
        // 30 days
        maxAge: 30 * 24 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
      return res.json(userData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
