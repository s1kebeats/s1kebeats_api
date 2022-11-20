export default class ApiError extends Error {
  status: number;
  errors: any[];

  constructor(status: number, message: string, errors: any[] = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static UnauthorizedUser(): ApiError {
    return new ApiError(401, 'Пользователь не авторизован');
  }
  static BadRequest(message: string, errors: any[] = []): ApiError {
    return new ApiError(400, message, errors);
  }
  static NotFound(message: string, errors: any[] = []): ApiError {
    return new ApiError(404, message, errors);
  }
  static NotActivatedUser(): ApiError {
    return new ApiError(401, 'Аккаунт не активирован');
  }
}
