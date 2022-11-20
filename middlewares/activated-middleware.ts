import ApiError from '../exceptions/api-error.js';
import { Request, Response, NextFunction } from 'express';

export default function (req: Request, res: Response, next: NextFunction) {
  // api error
  if (!req.user!.isActivated) {
    return next(ApiError.NotActivatedUser());
  }
  next();
}
