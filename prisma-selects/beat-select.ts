import { Prisma } from '@prisma/client';

const beatSelect: Prisma.BeatArgs = {
  select: {
    id: true,
    name: true,
    bpm: true,
    user: {
      select: {
        id: true,
        username: true,
        displayedName: true,
      },
    },
    image: true,
    mp3: true,
    wavePrice: true,
    tags: true,
  },
};
export default beatSelect;
