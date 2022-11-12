'use strict';
const beatSelect = require('./beat-select');
module.exports = {
  username: true,
  createdAt: true,
  displayedName: true,
  about: true,
  image: true,
  beats: {
    select: Object.assign(Object.assign({}, beatSelect), {
      user: false,
      plays: true,
    }),
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
