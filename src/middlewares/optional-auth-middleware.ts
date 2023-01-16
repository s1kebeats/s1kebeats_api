import passport from "passport";
import { Request, Response, NextFunction } from "express";
import passportJwtStrategy from "./passport-jwt-strategy";

passport.use(passportJwtStrategy);

export default function optionalAuth(err: Error, req: Request, res: Response, next: NextFunction) {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
}
