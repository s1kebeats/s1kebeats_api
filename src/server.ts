import app from "./app";
const start = async () => {
  try {
    app.listen(process.env.PORT ?? 5000, () => {
      console.log(`Running on: http://localhost:${process.env.PORT!}`);
    });
  } catch (error) {
    console.log(error);
  }
};
start();
