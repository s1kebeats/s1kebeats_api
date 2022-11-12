import { User } from '@prisma/client';

export default class UserDto {
  email: string;
  username: string;
  id: number;
  isActivated: boolean;

  constructor(model: User) {
    this.email = model.email;
    this.username = model.username;
    this.id = model.id;
    this.isActivated = model.isActivated;
  }
}
