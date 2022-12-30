import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import router from "./router/index.js";
import errorMiddleware from "./middlewares/error-middleware.js";

dotenv.config();

const app = express();
// enable req.ip
app.set("trust proxy", true);

app.use(fileUpload());
app.use(express.json({ limit: "1000mb" }));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

app.use("/api", router);

app.use(errorMiddleware);

export default app;
