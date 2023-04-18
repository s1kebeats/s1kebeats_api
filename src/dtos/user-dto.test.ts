import { describe, expect, test } from "vitest";
import UserDto from "./user-dto";
import { User } from "@prisma/client";

const testUser = {
  id: 0,
  username: "test",
  email: "test@gmail.com",
  password: "Password1234",
  isActivated: true,
  activationLink: "testActivationLink",
};

describe("UserDto", () => {
  test("should not contain isActivated field, activationLink and password", () => {
    const dto: any = new UserDto(testUser as User);

    expect(dto.password).toBeUndefined();
    expect(dto.isActivated).toBeUndefined();
    expect(dto.activationLink).toBeUndefined();
  });
});
