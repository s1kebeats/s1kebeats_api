import PrismaClient from "@prisma/client";

export default async function (body: any, mock: PrismaClient.Prisma.UserCreateInput) {
  for (const key of ["email", "username", "displayedName", "image"]) {
    expect(body.user[key]).toBe(mock[key as keyof typeof mock]);
  }
  expect(body.user.password).toBe(undefined);
  expect(body.user.activationLink).toBe(undefined);
  expect(typeof body.accessToken).toEqual("string");
}
