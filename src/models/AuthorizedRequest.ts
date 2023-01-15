import UserDto from 'dtos/user-dto'
import { Request } from 'express'

export default interface AuthorizedRequest extends Request {
  user: UserDto
}
