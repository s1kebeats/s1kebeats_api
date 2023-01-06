import userService from "../services/user-service";
import ApiError from "../exceptions/api-error";
import { Request, Response, NextFunction } from "express";
import PrismaClient from "@prisma/client";
import mediaService from "../services/media-service";

class UserController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const payload: Pick<
        PrismaClient.Prisma.UserCreateInput,
        // activationLink is generated automatically, so we don't need to pass it in the payload type
        "email" | "username" | "password"
      > = (({ email, username, password }: Record<string, string>) => ({
        email,
        username,
        password,
      }))(req.body);
      const userDto = await userService.register(payload);
      return res.json(userDto);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = req.ip;
      const { username, password, refresh }: { username: string; password: string; refresh: boolean } = req.body;
      const userData = await userService.login(username, password, ip, !!refresh);
      // set refresh token httpOnly cookie
      res.cookie("refreshToken", userData.refreshToken, {
        // 30 days
        maxAge: 30 * 24 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
      console.log(userData.refreshToken)
      return res.json(userData);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = req.ip;
      const { refreshToken }: { refreshToken: string } = req.cookies;
      if (!refreshToken) {
        next(ApiError.UnauthorizedUser());
        return;
      }
      await userService.logout(refreshToken, ip);
      // remove cookie with refresh token
      res.clearCookie("resfreshToken");
      return res.json("sucess");
    } catch (error) {
      next(error);
    }
  }

  async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const { activationLink } = req.params;
      await userService.activate(activationLink);
      return res.json("success");
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = req.ip;
      const { refreshToken }: { refreshToken: string } = req.cookies;
      if (!refreshToken) {
        next(ApiError.UnauthorizedUser());
        return;
      }
      const userData = await userService.refresh(refreshToken, ip);
      // update refresh token cookie
      res.cookie("refreshToken", userData.refreshToken, {
        // 30 days
        maxAge: 30 * 24 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
      return res.json(userData);
    } catch (error) {
      next(error);
    }
  }

  async edit(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const original = await userService.getUserById(userId);
      const payload: PrismaClient.Prisma.UserUpdateInput = (({
        username,
        displayedName,
        about,
        vk,
        youtube,
        instagram,
        image,
      }: Record<string, string>) => ({ username, displayedName, about, vk, youtube, instagram, image }))(req.body);
      // delete old profile image, if it's updated
      if (payload.image && original.image) {
        mediaService.deleteObject(original.image);
      }
      await userService.edit(userId, payload);

      return res.json("success");
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
