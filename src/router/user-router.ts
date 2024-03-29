import userController from "../controllers/user-controller";
import { body, param } from "express-validator";
import { Router } from "express";
import authMiddleware from "../middlewares/auth-middleware";
import validationMiddleware from "../middlewares/validation-middleware";

const router = Router();

// registration
router.post(
  "/register",
  body("email").isEmail().bail(),
  body("username")
    .notEmpty()
    .bail()
    // numbers and letters only
    .matches(/^[0-9a-zA-Z]+$/)
    .bail(),
  // min 8 chars, at least one digit and upper case letter
  body("password").isLength({ min: 8 }).bail().matches(/\d/).bail().matches(/[A-Z]/).bail(),
  validationMiddleware,
  userController.register
);

// login
router.post(
  "/login",
  body("username").notEmpty().bail(),
  body("password").notEmpty().bail(),
  validationMiddleware,
  userController.login
);

// users data editing
router.patch(
  "/edit",
  authMiddleware,
  body("username")
    .if(body("username").exists())
    .matches(/^[0-9a-zA-Z]+$/)
    .bail(),
  body("displayedName").if(body("displayedName").exists()).isLength({ max: 255 }).bail(),
  body("about").if(body("about").exists()).isLength({ max: 255 }).bail(),
  body("youtube").if(body("youtube").exists()).isLength({ max: 255 }).bail(),
  body("vk").if(body("vk").exists()).isLength({ max: 255 }).bail(),
  body("instagram").if(body("instagram").exists()).isLength({ max: 255 }).bail(),
  body("image").if(body("image").exists()).contains("image/").bail(),
  validationMiddleware,
  userController.edit
);

// logout
router.post("/logout", userController.logout);

// email activation
router.post("/activate/:activationLink", userController.activate);

// refresh tokens
router.post("/refresh", userController.refresh);

// check username availability
router.get(
  "/checkusername/:username",
  param("username")
    .notEmpty()
    .bail()
    // numbers and letters only
    .matches(/^[0-9a-zA-Z]+$/)
    .bail(),
  validationMiddleware,
  userController.checkUsername
);

export default router;
