import beatSelect from './beat-select.js';
import { Prisma } from '@prisma/client';

const authorIndividualSelect: Prisma.UserSelect = {
  username: true,
  createdAt: true,
  displayedName: true,
  about: true,
  image: true,
  beats: {
    select: {
      ...(new beatSelect({
        user: false,
        plays: true,
      }) as Prisma.BeatSelect),
      // _count: {
      //   select: {
      //     plays: true,
      //   }
      // }
    },
  },
  youtube: true,
  instagram: true,
  vk: true,
  _count: {
    select: {
      beats: true,
    },
  },
};
export default authorIndividualSelect;
