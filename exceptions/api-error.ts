export default class ApiError extends Error {
  status: number;
  errors: Error[];

  constructor(status: number, message: string, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static UnauthorizedUser(): ApiError {
    return new ApiError(401, 'Пользователь не авторизован');
  }
  static BadRequest(message: string, errors = []): ApiError {
    return new ApiError(400, message, errors);
  }
  static NotFound(message: string, errors = []): ApiError {
    return new ApiError(404, message, errors);
  }
};
