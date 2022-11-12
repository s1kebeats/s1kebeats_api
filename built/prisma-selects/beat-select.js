'use strict';
module.exports = {
  id: true,
  name: true,
  bpm: true,
  user: {
    select: {
      username: true,
      displayedName: true,
    },
  },
  image: true,
  mp3: true,
  wavePrice: true,
};
