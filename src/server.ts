import app from './app';
const start = async () => {
  try {
    app.listen(process.env.PORT, () => {
      console.log(`Running on: http://localhost:${process.env.PORT!}`);
    });
  } catch (error) {
    console.log(error);
  }
};
start();
