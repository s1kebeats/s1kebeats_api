import PrismaClient from "@prisma/client";

const activatedUsers: PrismaClient.Prisma.UserCreateInput[] = [
  {
    username: "first",
    displayedName: "firstUser",
    password: "Password1234",
    email: "first@gmail.com",
    activationLink: "first-activation-link",
    isActivated: true,
  },
  {
    username: "second",
    displayedName: "secondUser",
    image: "path/to/image",
    password: "Password1234",
    email: "second@gmail.com",
    activationLink: "second-activation-link",
    isActivated: true,
  },
];

const nonActivatedUser: PrismaClient.Prisma.UserCreateInput = {
  username: "nonActivated",
  displayedName: "nonActivatedUser",
  password: "Password1234",
  email: "nonActivated@gmail.com",
  activationLink: "nonActivated-activation-link",
  isActivated: false,
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

const beatCreateInputs: PrismaClient.Prisma.BeatCreateInput[] = [
  {
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
        username: activatedUsers[0].username,
      },
    },
    wavePrice: 499,
    wave: "wave/",
    mp3: "mp3/",
    image: "image/",
  },
  {
    name: "PSD",
    bpm: 160,
    user: {
      connect: {
        username: activatedUsers[0].username,
      },
    },
    wavePrice: 1099,
    wave: "/wave",
    mp3: "/mp3",
    tags: {
      connectOrCreate: [
        {
          where: { name: "s1kebeats" },
          create: { name: "s1kebeats" },
        },
        {
          where: { name: "agressive" },
          create: { name: "agressive" },
        },
        {
          where: { name: "Emotional" },
          create: { name: "Emotional" },
        },
      ],
    },
  },
  {
    name: "Turnt",
    bpm: 140,
    user: {
      connect: {
        username: activatedUsers[0].username,
      },
    },
    wavePrice: 1299,
    wave: "/wave",
    mp3: "/mp3",
    tags: {
      connectOrCreate: [
        {
          where: { name: "s1kebeats" },
          create: { name: "s1kebeats" },
        },
        {
          where: { name: "LilTjay" },
          create: { name: "LilTjay" },
        },
        {
          where: { name: "Emotional" },
          create: { name: "Emotional" },
        },
      ],
    },
  },
  {
    name: "outtahere",
    bpm: 122,
    user: {
      connect: {
        username: activatedUsers[0].username,
      },
    },
    wavePrice: 1499,
    wave: "/wave",
    mp3: "/mp3",
    tags: {
      connectOrCreate: [
        {
          where: { name: "s1kebeats" },
          create: { name: "s1kebeats" },
        },
        {
          where: { name: "gunna" },
          create: { name: "gunna" },
        },
        {
          where: { name: "wheezy" },
          create: { name: "wheezy" },
        },
      ],
    },
  },
  {
    name: "Chaze",
    bpm: 140,
    user: {
      connect: {
        username: activatedUsers[0].username,
      },
    },
    wavePrice: 899,
    wave: "/wave",
    mp3: "/mp3",
    tags: {
      connectOrCreate: [
        {
          where: { name: "s1kebeats" },
          create: { name: "s1kebeats" },
        },
        {
          where: { name: "keyglock" },
          create: { name: "keyglock" },
        },
      ],
    },
  },
];

export { activatedUsers, nonActivatedUser, beatUpload, beatCreateInputs };
