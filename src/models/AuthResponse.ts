import UserDto from '../dtos/user-dto'

export default interface AuthResponse {
  accessToken: string
  refreshToken?: string
  user: UserDto
}
