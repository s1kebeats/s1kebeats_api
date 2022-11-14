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
      ...beatSelect,
      user: false,
      plays: true,
    },
  },
  youtubeLink: true,
  instagramLink: true,
  vkLink: true,
  _count: {
    select: {
      beats: true,
    },
  },
};
export default authorIndividualSelect;
