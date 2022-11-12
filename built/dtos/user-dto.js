'use strict';
module.exports = class UserDto {
  constructor(model) {
    this.email = model.email;
    this.username = model.username;
    this.id = model.id;
    this.isActivated = model.isActivated;
  }
};
