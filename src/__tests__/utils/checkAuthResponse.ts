import PrismaClient from "@prisma/client";

export default async function (body: any, mock: PrismaClient.Prisma.UserCreateInput) {
  for (const key of ["email", "username", "displayedName", "image"]) {
    await expect(body.user[key]).toBe(mock[key as keyof typeof mock]);
  }
  await expect(body.user.password).toBe(undefined);
  await expect(body.user.activationLink).toBe(undefined);
  await expect(typeof body.accessToken).toEqual("string");
}
