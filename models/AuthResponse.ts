import UserDto from '../dtos/user-dto.js';

export default interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: UserDto;
}
