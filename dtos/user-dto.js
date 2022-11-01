module.exports = class UserDto {
  email;
  username;
  id;
  isActivated;

  constructor(model) {
    this.email = model.email;
    this.username = model.username;
    this.id = model.id;
    this.isActivated = model.isActivated;
  }
};
