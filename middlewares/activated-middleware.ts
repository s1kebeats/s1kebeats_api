import ApiError from '../exceptions/api-error.js';
import { Request, Response, NextFunction } from 'express';
// check for account activation through email link
export default function (req: Request, res: Response, next: NextFunction) {
  if (!req.user!.isActivated) {
    return next(ApiError.NotActivatedUser());
  }
  next();
}
