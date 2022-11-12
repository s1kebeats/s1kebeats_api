const authorSelect = require('./author-select');

module.exports = {
  id: true,
  name: true,
  bpm: true,
  description: true,
  createdAt: true,
  downloads: true,
  plays: true,
  image: true,
  mp3: true,
  wavePrice: true,
  stemsPrice: true,
  likes: true,
  tags: true,
  author: {
    select: authorSelect,
  },
};
