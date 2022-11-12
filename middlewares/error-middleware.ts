import ApiError from "../exceptions/api-error";
import { Request, Response, NextFunction } from "express"

export default function (err: Error, req: Request, res: Response, next: NextFunction): Response {
  console.log(err);
  // api error
  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ message: err.message, errors: err.errors });
  }
  // undexpected error
  return res.status(500).json({ message: 'Произошла непредвиденная ошибка' });
};
