import { User } from "@prisma/client";

export default class UserDto {
  email: string;
  username: string;
  id: number;
  image: string | null;
  displayedName: string | null;

  constructor(model: User) {
    this.id = model.id;
    this.email = model.email;
    this.username = model.username;
    this.displayedName = model.displayedName;
    this.image = model.image;
  }
}
