import PrismaClient from "@prisma/client";

const activatedUser: PrismaClient.Prisma.UserCreateInput = {
  username: "first",
  displayedName: "activatedUser",
  password: "Password1234",
  email: "first@gmail.com",
  activationLink: "first-activation-link",
  isActivated: true,
};

const secondUser: PrismaClient.Prisma.UserCreateInput = {
  username: "second",
  displayedName: "secondUser",
  image: "path/to/image",
  password: "Password1234",
  email: "second@gmail.com",
  activationLink: "second-activation-link",
  isActivated: true,
};

const beatUpload = {
  name: "first",
  bpm: 140,
  description: "first beat",
  tags: "first,testing,beat",

  wavePrice: 2,

  wave: "wave/",
  mp3: "mp3/",
};

const firstBeat = {
  name: "first",
  tags: {
    connectOrCreate: [
      {
        where: { name: "firstTag" },
        create: { name: "firstTag" },
      },
      {
        where: { name: "secondTag" },
        create: { name: "secondTag" },
      },
    ],
  },
  user: {
    connect: {
      username: activatedUser.username,
    },
  },
  wavePrice: 499,
  wave: "wave/",
  mp3: "mp3/",
  image: "image/",
};

export { activatedUser, secondUser, beatUpload, firstBeat };
