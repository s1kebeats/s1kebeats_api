import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import router from "./router";
import errorMiddleware from "./middlewares/error-middleware";
import { isLocalOrigin } from "./utils";

dotenv.config();

const app = express();
// enable req.ip
app.set("trust proxy", true);

app.use(fileUpload());
app.use(express.json({ limit: "1000mb" }));
app.use(cookieParser());
app.use(
  cors((req, cb) =>
    cb(null, {
      credentials: true,
      origin: isLocalOrigin(req.header("Origin")),
    })
  )
);
app.use("/api", router);

app.use(errorMiddleware);

export default app;
