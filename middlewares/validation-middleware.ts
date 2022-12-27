import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import ApiError from '../exceptions/api-error.js';

// express-validator errors handling
export default async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            ApiError.BadRequest('Data validation error.', errors.array())
        );
    }
    return next();
}
