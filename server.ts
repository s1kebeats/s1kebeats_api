import app from './app.js';
const start = async () => {
  try {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Listening on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};
start();
