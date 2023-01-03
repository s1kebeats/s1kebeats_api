"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b ||= {})
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/app.ts
var app_exports = {};
__export(app_exports, {
  default: () => app_default
});
module.exports = __toCommonJS(app_exports);
var import_dotenv = __toESM(require("dotenv"));
var import_express8 = __toESM(require("express"));
var import_cors = __toESM(require("cors"));
var import_cookie_parser = __toESM(require("cookie-parser"));
var import_express_fileupload = __toESM(require("express-fileupload"));

// src/services/user-service.ts
var import_client2 = __toESM(require("@prisma/client"));
var import_bcrypt = __toESM(require("bcrypt"));
var import_nanoid = require("nanoid");

// src/dtos/user-dto.ts
var UserDto = class {
  constructor(model) {
    this.id = model.id;
    this.email = model.email;
    this.username = model.username;
    this.displayedName = model.displayedName;
    this.image = model.image;
  }
};

// src/services/mail-service.ts
var import_nodemailer = __toESM(require("nodemailer"));
var MailService = class {
  constructor() {
    const opts = {
      host: process.env.SMTP_HOST,
      port: +process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    };
    this.transporter = import_nodemailer.default.createTransport(opts);
  }
  sendActivationMail(to, link) {
    return __async(this, null, function* () {
      yield this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: "\u0410\u043A\u0442\u0438\u0432\u0430\u0446\u0438\u044F \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430 \u043D\u0430 " + process.env.BASE_URL,
        html: `
                    <div>
                        <h1>\u0414\u043B\u044F \u0430\u043A\u0442\u0438\u0432\u0430\u0446\u0438\u0438 \u043F\u0435\u0440\u0435\u0439\u0434\u0438\u0442\u0435 \u043F\u043E \u0441\u0441\u044B\u043B\u043A\u0435:</h1>
                        <a href="${link}">${link}</a>
                    </div>
                `
      });
    });
  }
};
var mail_service_default = new MailService();

// src/services/token-service.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_client = __toESM(require("@prisma/client"));
var prisma = new import_client.default.PrismaClient();
var TokenService = class {
  generateTokens(payload) {
    const accessToken = import_jsonwebtoken.default.sign(Object.assign({}, payload), process.env.JWT_ACCESS_SECRET, {
      expiresIn: "30m"
    });
    const refreshToken = import_jsonwebtoken.default.sign(Object.assign({}, payload), process.env.JWT_REFRESH_SECRET, {
      expiresIn: "30d"
    });
    return {
      accessToken,
      refreshToken
    };
  }
  saveToken(userId, ip, refreshToken) {
    return __async(this, null, function* () {
      const tokenUpsertArgs = {
        where: {
          ip
        },
        update: {
          refreshToken
        },
        create: {
          ip,
          refreshToken,
          user: {
            connect: { id: userId }
          }
        }
      };
      const token = yield prisma.token.upsert(tokenUpsertArgs);
      return token;
    });
  }
  removeToken(ip) {
    return __async(this, null, function* () {
      const tokenDeleteArgs = {
        where: {
          ip
        }
      };
      const token = yield prisma.token.delete(tokenDeleteArgs);
      return token;
    });
  }
  findToken(refreshToken) {
    return __async(this, null, function* () {
      const token = yield prisma.token.findUnique({
        where: {
          refreshToken
        }
      });
      return token;
    });
  }
  validateAccessToken(accessToken) {
    try {
      const decoded = import_jsonwebtoken.default.verify(accessToken, process.env.JWT_ACCESS_SECRET);
      return decoded;
    } catch (error) {
      return null;
    }
  }
  validateRefreshToken(refreshToken) {
    try {
      const decoded = import_jsonwebtoken.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      return decoded;
    } catch (error) {
      return null;
    }
  }
};
var token_service_default = new TokenService();

// src/exceptions/api-error.ts
var ApiError = class extends Error {
  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
  static UnauthorizedUser() {
    return new ApiError(401, "Not authorized");
  }
  static BadRequest(message, errors = []) {
    return new ApiError(400, message, errors);
  }
  static NotFound(message, errors = []) {
    return new ApiError(404, message, errors);
  }
  static NotActivatedEmail() {
    return new ApiError(403, "Email is not confirmed");
  }
};

// src/services/user-service.ts
var prisma2 = new import_client2.default.PrismaClient();
var UserService = class {
  generateData(user, ip) {
    return __async(this, null, function* () {
      const userDto = new UserDto(user);
      const tokens = token_service_default.generateTokens(userDto);
      yield token_service_default.saveToken(userDto.id, ip, tokens.refreshToken);
      return __spreadProps(__spreadValues({}, tokens), {
        user: userDto
      });
    });
  }
  register(_0) {
    return __async(this, arguments, function* ({
      email,
      username,
      password
    }) {
      const existingUser = yield prisma2.user.findUnique({
        where: { username }
      });
      if (existingUser) {
        throw ApiError.BadRequest(`Username "${username}" is already taken.`);
      }
      const hashedPassword = yield import_bcrypt.default.hash(password, 3);
      const activationLink = (0, import_nanoid.nanoid)(64);
      const userCreateArgs = {
        data: {
          email,
          username,
          password: hashedPassword,
          activationLink
        }
      };
      const user = yield prisma2.user.create(userCreateArgs);
      yield mail_service_default.sendActivationMail(email, `${process.env.BASE_URL}/api/activate/${activationLink}`);
      const userDto = new UserDto(user);
      return userDto;
    });
  }
  activate(activationLink) {
    return __async(this, null, function* () {
      const user = yield prisma2.user.findUnique({
        where: {
          activationLink
        }
      });
      if (!user) {
        throw ApiError.BadRequest("Wrong activation link.");
      }
      yield prisma2.user.update({
        where: {
          activationLink
        },
        data: {
          isActivated: true
        }
      });
    });
  }
  login(username, password, ip) {
    return __async(this, null, function* () {
      const user = yield prisma2.user.findUnique({
        where: { username }
      });
      if (!user) {
        throw ApiError.UnauthorizedUser();
      }
      if (!user.isActivated) {
        throw ApiError.NotActivatedEmail();
      }
      const passwordEquals = yield import_bcrypt.default.compare(password, user.password);
      if (!passwordEquals) {
        throw ApiError.UnauthorizedUser();
      }
      const data = yield this.generateData(user, ip);
      return data;
    });
  }
  logout(refreshToken, ip) {
    return __async(this, null, function* () {
      const token = yield token_service_default.findToken(refreshToken);
      if (!token || token.ip !== ip) {
        throw ApiError.UnauthorizedUser();
      }
      yield token_service_default.removeToken(ip);
    });
  }
  refresh(refreshToken, ip) {
    return __async(this, null, function* () {
      const userData = token_service_default.validateRefreshToken(refreshToken);
      const tokenFromDb = yield token_service_default.findToken(refreshToken);
      if (!userData || !tokenFromDb || tokenFromDb.ip !== ip) {
        throw ApiError.UnauthorizedUser();
      }
      const user = yield prisma2.user.findUnique({
        where: { id: userData.id }
      });
      const data = yield this.generateData(user, ip);
      return data;
    });
  }
  edit(userId, payload) {
    return __async(this, null, function* () {
      if (payload.username) {
        const existingUser = yield prisma2.user.findUnique({
          where: { username: payload.username }
        });
        if (existingUser) {
          throw ApiError.BadRequest(`Username "${payload.username}" is already taken.`);
        }
      }
      const userUpdateArgs = {
        where: { id: userId },
        data: payload
      };
      yield prisma2.user.update(userUpdateArgs);
    });
  }
  getUserById(id) {
    return __async(this, null, function* () {
      const user = yield prisma2.user.findUnique({
        where: { id }
      });
      if (!user) {
        throw ApiError.NotFound(`User was not found.`);
      }
      return user;
    });
  }
};
var user_service_default = new UserService();

// src/services/media-service.ts
var import_aws_sdk = __toESM(require("aws-sdk"));
var import_nanoid2 = require("nanoid");
var import_path = __toESM(require("path"));
var awsConfig = {
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_BUCKET_REGION
};
var s3 = new import_aws_sdk.default.S3(awsConfig);
var MediaService = class {
  validate(file, extensions, maxSize) {
    if (extensions) {
      const ext = import_path.default.extname(file.name);
      if (Array.isArray(extensions)) {
        if (!extensions.includes(ext)) {
          throw ApiError.BadRequest(`Send file in ${extensions.join("/")} format.`);
        }
      } else {
        if (ext !== extensions) {
          throw ApiError.BadRequest(`Send file in ${extensions} format.`);
        }
      }
    }
    if (maxSize) {
      if (file.size > maxSize) {
        throw ApiError.BadRequest(`Max file size is ${maxSize / 1024 / 1024}mb.`);
      }
    }
  }
  validateMedia(file, path2) {
    switch (path2) {
      case "image": {
        this.validate(file, [".png", ".jpg", ".jpeg"]);
        break;
      }
      case "mp3": {
        this.validate(
          file,
          ".mp3",
          150 * 1024 * 1024
        );
        break;
      }
      case "wav": {
        this.validate(
          file,
          ".wav",
          300 * 1024 * 1024
        );
        break;
      }
      case "stems": {
        this.validate(
          file,
          [".zip", ".rar"],
          500 * 1024 * 1024
        );
        break;
      }
    }
  }
  awsUpload(file, path2) {
    return __async(this, null, function* () {
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: path2 + "/" + (0, import_nanoid2.nanoid)(36),
        Body: file.data
      };
      return s3.upload(params).promise();
    });
  }
  deleteObject(key) {
    return __async(this, null, function* () {
      const params = {
        Key: key,
        Bucket: process.env.AWS_BUCKET_NAME
      };
      return s3.deleteObject(params).promise();
    });
  }
  getMedia(key) {
    return __async(this, null, function* () {
      const data = yield s3.getObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
      });
      return data;
    });
  }
};
var media_service_default = new MediaService();

// src/controllers/user-controller.ts
var UserController = class {
  register(req, res, next) {
    return __async(this, null, function* () {
      try {
        const payload = (({ email, username, password }) => ({
          email,
          username,
          password
        }))(req.body);
        const userDto = yield user_service_default.register(payload);
        return res.json(userDto);
      } catch (error) {
        next(error);
      }
    });
  }
  login(req, res, next) {
    return __async(this, null, function* () {
      try {
        const ip = req.ip;
        const { username, password } = req.body;
        const userData = yield user_service_default.login(username, password, ip);
        res.cookie("refreshToken", userData.refreshToken, {
          maxAge: 30 * 24 * 60 * 1e3,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production"
        });
        return res.json(userData);
      } catch (error) {
        next(error);
      }
    });
  }
  logout(req, res, next) {
    return __async(this, null, function* () {
      try {
        const ip = req.ip;
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
          return next(ApiError.UnauthorizedUser());
        }
        yield user_service_default.logout(refreshToken, ip);
        res.clearCookie("resfreshToken");
        return res.json("sucess");
      } catch (error) {
        next(error);
      }
    });
  }
  activate(req, res, next) {
    return __async(this, null, function* () {
      try {
        const { activationLink } = req.params;
        yield user_service_default.activate(activationLink);
        return res.json("success");
      } catch (error) {
        next(error);
      }
    });
  }
  refresh(req, res, next) {
    return __async(this, null, function* () {
      try {
        const ip = req.ip;
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
          return next(ApiError.UnauthorizedUser());
        }
        const userData = yield user_service_default.refresh(refreshToken, ip);
        res.cookie("refreshToken", userData.refreshToken, {
          maxAge: 30 * 24 * 60 * 1e3,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production"
        });
        return res.json(userData);
      } catch (error) {
        next(error);
      }
    });
  }
  edit(req, res, next) {
    return __async(this, null, function* () {
      try {
        const userId = req.user.id;
        const original = yield user_service_default.getUserById(userId);
        const payload = (({
          username,
          displayedName,
          about,
          vk,
          youtube,
          instagram,
          image
        }) => ({ username, displayedName, about, vk, youtube, instagram, image }))(req.body);
        if (payload.image && original.image) {
          media_service_default.deleteObject(original.image);
        }
        yield user_service_default.edit(userId, payload);
        return res.json("success");
      } catch (error) {
        next(error);
      }
    });
  }
};
var user_controller_default = new UserController();

// src/router/user-router.ts
var import_express_validator2 = require("express-validator");
var import_express = require("express");

// src/middlewares/auth-middleware.ts
function auth_middleware_default(req, res, next) {
  return __async(this, null, function* () {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return next(ApiError.UnauthorizedUser());
      }
      const accessToken = authHeader.split(" ")[1];
      if (!accessToken) {
        return next(ApiError.UnauthorizedUser());
      }
      const userData = token_service_default.validateAccessToken(accessToken);
      if (!userData) {
        return next(ApiError.UnauthorizedUser());
      }
      req.user = userData;
      next();
    } catch (error) {
      return next(ApiError.UnauthorizedUser());
    }
  });
}

// src/middlewares/validation-middleware.ts
var import_express_validator = require("express-validator");
function validation_middleware_default(req, res, next) {
  return __async(this, null, function* () {
    const errors = (0, import_express_validator.validationResult)(req);
    if (!errors.isEmpty()) {
      return next(ApiError.BadRequest("Data validation error", errors.array()));
    }
    return next();
  });
}

// src/router/user-router.ts
var router = (0, import_express.Router)();
router.post(
  "/register",
  (0, import_express_validator2.body)("email").isEmail().bail(),
  (0, import_express_validator2.body)("username").notEmpty().bail().matches(/^[0-9a-zA-Z]+$/).bail(),
  (0, import_express_validator2.body)("password").isLength({ min: 8 }).bail().matches(/\d/).bail().matches(/[A-Z]/).bail(),
  validation_middleware_default,
  user_controller_default.register
);
router.post(
  "/login",
  (0, import_express_validator2.body)("username").notEmpty().bail(),
  (0, import_express_validator2.body)("password").notEmpty().bail(),
  validation_middleware_default,
  user_controller_default.login
);
router.post(
  "/edit",
  auth_middleware_default,
  (0, import_express_validator2.body)("username").if((0, import_express_validator2.body)("username").exists()).matches(/^[0-9a-zA-Z]+$/).bail(),
  (0, import_express_validator2.body)("displayedName").if((0, import_express_validator2.body)("displayedName").exists()).isLength({ max: 255 }).bail(),
  (0, import_express_validator2.body)("about").if((0, import_express_validator2.body)("about").exists()).isLength({ max: 255 }).bail(),
  (0, import_express_validator2.body)("youtube").if((0, import_express_validator2.body)("youtube").exists()).isLength({ max: 255 }).bail(),
  (0, import_express_validator2.body)("vk").if((0, import_express_validator2.body)("vk").exists()).isLength({ max: 255 }).bail(),
  (0, import_express_validator2.body)("instagram").if((0, import_express_validator2.body)("instagram").exists()).isLength({ max: 255 }).bail(),
  validation_middleware_default,
  user_controller_default.edit
);
router.post("/logout", user_controller_default.logout);
router.get("/activate/:activationLink", user_controller_default.activate);
router.get("/refresh", user_controller_default.refresh);
var user_router_default = router;

// src/services/author-service.ts
var import_client6 = __toESM(require("@prisma/client"));

// src/prisma-selects/author-select.ts
var import_client3 = __toESM(require("@prisma/client"));
var authorSelect = import_client3.default.Prisma.validator()({
  select: {
    id: true,
    username: true,
    displayedName: true,
    image: true
  }
});
var author_select_default = authorSelect;

// src/prisma-selects/author-individual-select.ts
var import_client5 = __toESM(require("@prisma/client"));

// src/prisma-selects/beat-for-author.ts
var import_client4 = __toESM(require("@prisma/client"));
var beatForAuthorSelect = import_client4.default.Prisma.validator()({
  select: {
    id: true,
    name: true,
    bpm: true,
    image: true,
    mp3: true,
    wavePrice: true,
    tags: true
  }
});
var beat_for_author_default = beatForAuthorSelect;

// src/prisma-selects/author-individual-select.ts
var authorIndividualSelect = import_client5.default.Prisma.validator()({
  select: {
    id: true,
    username: true,
    createdAt: true,
    displayedName: true,
    about: true,
    image: true,
    beats: __spreadValues({}, beat_for_author_default),
    youtube: true,
    instagram: true,
    vk: true,
    _count: {
      select: {
        beats: true
      }
    }
  }
});
var author_individual_select_default = authorIndividualSelect;

// src/services/author-service.ts
var prisma3 = new import_client6.default.PrismaClient();
var AuthorService = class {
  getAuthors(viewed) {
    return __async(this, null, function* () {
      const authors = yield prisma3.user.findMany(__spreadProps(__spreadValues({}, author_select_default), {
        take: 10,
        skip: viewed
      }));
      return authors;
    });
  }
  findAuthors(query5, viewed) {
    return __async(this, null, function* () {
      const authorFindManyArgs = __spreadProps(__spreadValues({
        where: {
          OR: [
            {
              username: {
                contains: query5
              }
            },
            {
              displayedName: {
                contains: query5
              }
            }
          ]
        }
      }, author_select_default), {
        take: 10,
        skip: viewed
      });
      const authors = yield prisma3.user.findMany(authorFindManyArgs);
      return authors;
    });
  }
  getAuthorByUsername(username) {
    return __async(this, null, function* () {
      const authorFindUniqueArgs = __spreadValues({
        where: {
          username
        }
      }, author_individual_select_default);
      const author = yield prisma3.user.findUnique(authorFindUniqueArgs);
      if (!author) {
        throw ApiError.NotFound(`Author was not found.`);
      }
      return author;
    });
  }
};
var author_service_default = new AuthorService();

// src/controllers/author-controller.ts
var AuthorController = class {
  getAuthors(req, res, next) {
    return __async(this, null, function* () {
      try {
        let authors;
        if (req.query.q) {
          authors = yield author_service_default.findAuthors(req.query.q, req.query.viewed ? +req.query.viewed : 0);
        } else {
          authors = yield author_service_default.getAuthors(req.query.viewed ? +req.query.viewed : 0);
        }
        return res.json({
          authors,
          viewed: req.query.viewed ? +req.query.viewed + authors.length : authors.length
        });
      } catch (error) {
        next(error);
      }
    });
  }
  getIndividualAuthor(req, res, next) {
    return __async(this, null, function* () {
      try {
        const username = req.params.username;
        const author = yield author_service_default.getAuthorByUsername(username);
        return res.json(author);
      } catch (error) {
        next(error);
      }
    });
  }
};
var author_controller_default = new AuthorController();

// src/router/author-router.ts
var import_express2 = require("express");
var import_express_validator3 = require("express-validator");
var router2 = (0, import_express2.Router)();
router2.get(
  "/",
  (0, import_express_validator3.query)("viewed").if((0, import_express_validator3.query)("viewed").exists()).isDecimal().bail(),
  validation_middleware_default,
  author_controller_default.getAuthors
);
router2.get("/:username", author_controller_default.getIndividualAuthor);
var author_router_default = router2;

// src/services/beat-service.ts
var import_client9 = __toESM(require("@prisma/client"));

// src/prisma-selects/beat-individual-select.ts
var import_client7 = __toESM(require("@prisma/client"));
var beatIndividualSelect = import_client7.default.Prisma.validator()({
  select: {
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
    tags: true,
    user: __spreadValues({}, author_select_default),
    comments: {
      take: 10,
      select: {
        content: true,
        user: __spreadValues({}, author_select_default)
      }
    },
    _count: {
      select: {
        likes: true
      }
    }
  }
});
var beat_individual_select_default = beatIndividualSelect;

// src/prisma-selects/beat-select.ts
var import_client8 = __toESM(require("@prisma/client"));
var beatSelect = import_client8.default.Prisma.validator()({
  select: {
    id: true,
    name: true,
    bpm: true,
    image: true,
    mp3: true,
    wavePrice: true,
    user: {
      select: {
        id: true,
        username: true,
        displayedName: true
      }
    }
  }
});
var beat_select_default = beatSelect;

// src/services/beat-service.ts
var prisma4 = new import_client9.default.PrismaClient();
var BeatService = class {
  getBeats(viewed = 0) {
    return __async(this, null, function* () {
      const beats = yield prisma4.beat.findMany(__spreadProps(__spreadValues({}, beat_select_default), {
        skip: viewed,
        take: 10
      }));
      return beats;
    });
  }
  formatBeatOrderBy(orderBy) {
    if (orderBy.includes("Lower")) {
      return {
        [orderBy.slice(0, -5)]: "asc"
      };
    }
    if (orderBy.includes("Higher")) {
      return {
        [orderBy.slice(0, -6)]: "desc"
      };
    }
    return {
      id: "desc"
    };
  }
  findBeats(_0) {
    return __async(this, arguments, function* ({ q, bpm, tags, orderBy }, viewed = 0) {
      let nameQuery = {};
      if (q) {
        nameQuery = {
          OR: [
            {
              name: {
                contains: q,
                mode: "insensitive"
              }
            },
            {
              user: {
                OR: [
                  {
                    username: {
                      contains: q,
                      mode: "insensitive"
                    }
                  },
                  {
                    displayedName: {
                      contains: q,
                      mode: "insensitive"
                    }
                  }
                ]
              }
            }
          ]
        };
      }
      const queryArgs = {
        take: 10,
        skip: viewed,
        orderBy: orderBy ? this.formatBeatOrderBy(orderBy) : {
          id: "desc"
        },
        where: __spreadProps(__spreadValues({}, nameQuery), {
          bpm: {
            equals: bpm
          },
          tags: tags ? {
            some: {
              name: {
                in: tags
              }
            }
          } : void 0
        })
      };
      const beats = yield prisma4.beat.findMany(__spreadValues(__spreadValues({}, queryArgs), beat_select_default));
      return beats;
    });
  }
  getIndividualBeat(id) {
    return __async(this, null, function* () {
      const beatFindUniqueArgs = __spreadValues({
        where: {
          id
        }
      }, beat_individual_select_default);
      const beat = yield prisma4.beat.findUnique(beatFindUniqueArgs);
      if (!beat) {
        throw ApiError.NotFound(`Beat was not found.`);
      }
      const relatedBeats = yield this.findBeats({
        tags: beat.tags.map((item) => item.name),
        q: beat.user.username
      });
      return __spreadProps(__spreadValues({}, beat), {
        related: relatedBeats.filter((item) => item.id !== beat.id)
      });
    });
  }
  getBeatById(id) {
    return __async(this, null, function* () {
      const beat = yield prisma4.beat.findUnique({
        where: {
          id
        }
      });
      if (!beat) {
        throw ApiError.NotFound(`Beat was not found.`);
      }
      return beat;
    });
  }
  beatAwsDelete(beat) {
    return __async(this, null, function* () {
      const fileData = [null, null, null, null];
      fileData[0] = media_service_default.deleteObject(beat.wave);
      fileData[1] = media_service_default.deleteObject(beat.mp3);
      if (beat.image) {
        fileData[2] = media_service_default.deleteObject(beat.image);
      }
      if (beat.stems) {
        fileData[3] = media_service_default.deleteObject(beat.stems);
      }
      return yield Promise.all(fileData);
    });
  }
  uploadBeat(data) {
    return __async(this, null, function* () {
      const beat = yield prisma4.beat.create(__spreadValues({
        data
      }, beat_individual_select_default));
      return beat;
    });
  }
  editBeat(beatId, data) {
    return __async(this, null, function* () {
      const beat = yield prisma4.beat.update(__spreadValues({
        where: {
          id: beatId
        },
        data
      }, beat_individual_select_default));
      return beat;
    });
  }
  deleteBeat(beat) {
    return __async(this, null, function* () {
      yield this.beatAwsDelete(beat);
      yield prisma4.beat.delete({
        where: {
          id: beat.id
        }
      });
    });
  }
};
var beat_service_default = new BeatService();

// src/services/comment-service.ts
var import_client10 = __toESM(require("@prisma/client"));
var prisma5 = new import_client10.default.PrismaClient();
var CommentService = class {
  uploadComment(data) {
    return __async(this, null, function* () {
      const comment = yield prisma5.comment.create({
        data
      });
      return comment;
    });
  }
  getComments(beatId, viewed = 0) {
    return __async(this, null, function* () {
      const comments = yield prisma5.comment.findMany({
        where: {
          beatId
        },
        take: 10,
        skip: viewed
      });
      return comments;
    });
  }
  getCommentById(commentId) {
    return __async(this, null, function* () {
      const comment = yield prisma5.comment.findUnique({
        where: { id: commentId }
      });
      return comment;
    });
  }
  deleteComment(commentId) {
    return __async(this, null, function* () {
      yield prisma5.comment.delete({
        where: { id: commentId }
      });
    });
  }
};
var comment_service_default = new CommentService();

// src/services/like-service.ts
var import_client11 = __toESM(require("@prisma/client"));
var prisma6 = new import_client11.default.PrismaClient();
var LikeService = class {
  getLikeByIdentifier(beatId, userId) {
    return __async(this, null, function* () {
      const like = yield prisma6.like.findUnique({
        where: {
          likeIdentifier: { userId, beatId }
        }
      });
      return like;
    });
  }
  deleteLike(beatId, userId) {
    return __async(this, null, function* () {
      const like = yield prisma6.like.delete({
        where: {
          likeIdentifier: { userId, beatId }
        }
      });
      return like;
    });
  }
  createLike(beatId, userId) {
    return __async(this, null, function* () {
      const like = yield prisma6.like.create({
        data: {
          user: {
            connect: { id: userId }
          },
          beat: {
            connect: { id: beatId }
          }
        }
      });
      return like;
    });
  }
};
var like_service_default = new LikeService();

// src/controllers/beat-controller.ts
var BeatController = class {
  getBeats(req, res, next) {
    return __async(this, null, function* () {
      try {
        let beats;
        if (Object.keys(req.query).length) {
          const query5 = (({
            q,
            bpm,
            tags,
            orderBy
          }) => ({
            q,
            bpm: bpm ? +bpm : void 0,
            tags: tags ? tags.split(",") : void 0,
            orderBy
          }))(req.query);
          beats = yield beat_service_default.findBeats(query5, req.query.viewed ? +req.query.viewed : 0);
        } else {
          beats = yield beat_service_default.getBeats(req.query.viewed ? +req.query.viewed : 0);
        }
        return res.json({
          beats,
          viewed: req.query.viewed ? +req.query.viewed + beats.length : beats.length
        });
      } catch (error) {
        next(error);
      }
    });
  }
  getIndividualBeat(req, res, next) {
    return __async(this, null, function* () {
      try {
        const id = +req.params.id;
        const beat = yield beat_service_default.getIndividualBeat(id);
        return res.json(beat);
      } catch (error) {
        next(error);
      }
    });
  }
  upload(req, res, next) {
    return __async(this, null, function* () {
      try {
        const userId = req.user.id;
        const payload = (({
          name,
          bpm,
          description,
          tags,
          stemsPrice,
          wavePrice,
          wave,
          mp3,
          stems,
          image
        }) => ({
          name,
          bpm: bpm ? +bpm : void 0,
          description,
          tags: tags ? {
            connectOrCreate: tags.split(",").map((tag) => {
              if (!tag.match(/^[0-9a-zA-Z]+$/)) {
                throw ApiError.BadRequest("Wrong tags");
              }
              return {
                where: { name: tag },
                create: { name: tag }
              };
            })
          } : void 0,
          stemsPrice: stemsPrice ? +stemsPrice : void 0,
          wavePrice: +wavePrice,
          wave,
          mp3,
          stems,
          image,
          user: {
            connect: { id: userId }
          }
        }))(req.body);
        const beat = yield beat_service_default.uploadBeat(payload);
        return res.json(beat);
      } catch (error) {
        next(error);
      }
    });
  }
  edit(req, res, next) {
    return __async(this, null, function* () {
      try {
        const userId = req.user.id;
        const original = yield beat_service_default.getBeatById(+req.params.id);
        if (userId !== original.userId) {
          return next(ApiError.UnauthorizedUser());
        }
        const payload = (({
          name,
          bpm,
          description,
          tags,
          wavePrice,
          stemsPrice,
          image,
          wave,
          mp3,
          stems
        }) => ({
          name,
          bpm: +bpm,
          description,
          tags: tags ? {
            set: [],
            connectOrCreate: tags.split(",").map((tag) => {
              return {
                where: { name: tag },
                create: { name: tag }
              };
            })
          } : void 0,
          wavePrice: +wavePrice,
          stemsPrice: +stemsPrice,
          image,
          wave,
          mp3,
          stems
        }))(req.body);
        const merged = __spreadValues(__spreadValues({}, original), payload);
        if (merged.stemsPrice && !merged.stems || merged.stems && !merged.stemsPrice) {
          return next(ApiError.BadRequest("Provide both stems and stems price"));
        }
        const mediaFileKeys = ["mp3", "wave", "stems", "image"];
        for (const key of mediaFileKeys) {
          if (payload[key] && original[key]) {
            media_service_default.deleteObject(original[key]);
          }
        }
        const beat = yield beat_service_default.editBeat(original.id, payload);
        return res.json(beat);
      } catch (error) {
        next(error);
      }
    });
  }
  comment(req, res, next) {
    return __async(this, null, function* () {
      try {
        const userId = req.user.id;
        const id = +req.params.id;
        const beat = yield beat_service_default.getBeatById(id);
        const payload = {
          user: {
            connect: { id: userId }
          },
          beat: {
            connect: { id: beat.id }
          },
          content: req.body.content
        };
        const comment = yield comment_service_default.uploadComment(payload);
        return res.json(comment);
      } catch (error) {
        next(error);
      }
    });
  }
  likeToggle(req, res, next) {
    return __async(this, null, function* () {
      try {
        const userId = req.user.id;
        const id = +req.params.id;
        const beat = yield beat_service_default.getBeatById(id);
        let like;
        like = yield like_service_default.getLikeByIdentifier(beat.id, userId);
        if (like) {
          like = yield like_service_default.deleteLike(beat.id, userId);
        } else {
          like = yield like_service_default.createLike(beat.id, userId);
        }
        return res.json(like);
      } catch (error) {
        next(error);
      }
    });
  }
  delete(req, res, next) {
    return __async(this, null, function* () {
      try {
        const userId = req.user.id;
        const id = +req.params.id;
        const beat = yield beat_service_default.getBeatById(id);
        if (userId !== beat.userId) {
          return next(ApiError.UnauthorizedUser());
        }
        yield beat_service_default.deleteBeat(beat);
        return res.json("success");
      } catch (error) {
        next(error);
      }
    });
  }
};
var beat_controller_default = new BeatController();

// src/router/beat-router.ts
var import_express_validator4 = require("express-validator");
var import_express3 = require("express");
var router3 = (0, import_express3.Router)();
router3.post(
  "/upload",
  auth_middleware_default,
  (0, import_express_validator4.body)("name").notEmpty().bail().isLength({ max: 255 }).bail(),
  (0, import_express_validator4.body)("wavePrice").notEmpty().bail().isDecimal().bail(),
  (0, import_express_validator4.body)("wave").notEmpty().bail().contains("wave/").bail(),
  (0, import_express_validator4.body)("mp3").notEmpty().bail().contains("mp3/").bail(),
  (0, import_express_validator4.body)("stemsPrice").if((0, import_express_validator4.body)("stemsPrice").exists()).isDecimal().bail(),
  (0, import_express_validator4.body)("stemsPrice").if((0, import_express_validator4.body)("stems").exists()).notEmpty().bail(),
  (0, import_express_validator4.body)("stems").if((0, import_express_validator4.body)("stems").exists()).contains("stems/").bail(),
  (0, import_express_validator4.body)("stems").if((0, import_express_validator4.body)("stemsPrice").exists()).notEmpty().bail(),
  (0, import_express_validator4.body)("image").if((0, import_express_validator4.body)("image").exists()).contains("image/").bail(),
  (0, import_express_validator4.body)("bpm").if((0, import_express_validator4.body)("bpm").exists()).isDecimal().bail(),
  (0, import_express_validator4.body)("description").if((0, import_express_validator4.body)("description").exists()).isLength({ max: 255 }).bail(),
  validation_middleware_default,
  beat_controller_default.upload
);
router3.get(
  "/",
  (0, import_express_validator4.query)("viewed").if((0, import_express_validator4.query)("viewed").exists()).isDecimal().bail(),
  validation_middleware_default,
  beat_controller_default.getBeats
);
router3.get("/:id", (0, import_express_validator4.param)("id").isDecimal().bail(), validation_middleware_default, beat_controller_default.getIndividualBeat);
router3.post(
  "/:id/comment",
  auth_middleware_default,
  (0, import_express_validator4.param)("id").isDecimal().bail(),
  (0, import_express_validator4.body)("content").notEmpty().isLength({ max: 255 }).bail(),
  validation_middleware_default,
  beat_controller_default.comment
);
router3.post(
  "/:id/like",
  auth_middleware_default,
  (0, import_express_validator4.param)("id").isDecimal().bail(),
  validation_middleware_default,
  beat_controller_default.likeToggle
);
router3.post("/:id/delete", auth_middleware_default, (0, import_express_validator4.param)("id").isDecimal().bail(), validation_middleware_default, beat_controller_default.delete);
router3.post(
  "/:id/edit",
  auth_middleware_default,
  (0, import_express_validator4.param)("id").isDecimal().bail(),
  (0, import_express_validator4.body)("name").if((0, import_express_validator4.body)("name").exists()).isLength({ max: 255 }).bail(),
  (0, import_express_validator4.body)("wavePrice").if((0, import_express_validator4.body)("wavePrice").exists()).isDecimal().bail(),
  (0, import_express_validator4.body)("wave").if((0, import_express_validator4.body)("wave").exists()).contains("wave/").bail(),
  (0, import_express_validator4.body)("mp3").if((0, import_express_validator4.body)("mp3").exists()).contains("mp3/").bail(),
  (0, import_express_validator4.body)("stemsPrice").if((0, import_express_validator4.body)("stemsPrice").exists()).isDecimal().bail(),
  (0, import_express_validator4.body)("stems").if((0, import_express_validator4.body)("stems").exists()).contains("stems/").bail(),
  (0, import_express_validator4.body)("image").if((0, import_express_validator4.body)("image").exists()).contains("image/").bail(),
  (0, import_express_validator4.body)("bpm").if((0, import_express_validator4.body)("bpm").exists()).isDecimal().bail(),
  (0, import_express_validator4.body)("description").if((0, import_express_validator4.body)("description").exists()).isLength({ max: 255 }).bail(),
  validation_middleware_default,
  beat_controller_default.edit
);
var beat_router_default = router3;

// src/router/media-router.ts
var import_express4 = require("express");
var import_express_validator5 = require("express-validator");

// src/controllers/media-controller.ts
var import_sharp = __toESM(require("sharp"));
var MediaController = class {
  upload(req, res, next) {
    return __async(this, null, function* () {
      try {
        const { path: path2 } = req.body;
        if (!req.files || !req.files.file) {
          return next(ApiError.BadRequest("File wasn't provided"));
        }
        const file = req.files.file;
        media_service_default.validateMedia(file, path2);
        if (path2 === "image") {
          file.data = yield (0, import_sharp.default)(file.data).webp({ quality: 50 }).toBuffer();
        }
        const media = yield media_service_default.awsUpload(file, path2);
        return res.json(media.Key);
      } catch (error) {
        next(error);
      }
    });
  }
  getMedia(req, res, next) {
    return __async(this, null, function* () {
      try {
        const { key, path: path2 } = req.params;
        const media = yield media_service_default.getMedia(`${path2}/${key}`);
        media.createReadStream().on("error", (error) => {
          if (error.code === "AccessDenied") {
            return next(ApiError.NotFound("File was not found."));
          }
        }).pipe(res);
      } catch (error) {
        next(error);
      }
    });
  }
};
var media_controller_default = new MediaController();

// src/router/media-router.ts
var router4 = (0, import_express4.Router)();
router4.get("/:path/:key", media_controller_default.getMedia);
router4.post("/upload", auth_middleware_default, (0, import_express_validator5.body)("path").notEmpty().bail(), validation_middleware_default, media_controller_default.upload);
var media_router_default = router4;

// src/router/index.ts
var import_express7 = require("express");

// src/router/comment-router.ts
var import_express5 = require("express");
var import_express_validator6 = require("express-validator");

// src/controllers/comment-controller.ts
var CommentController = class {
  deleteComment(req, res, next) {
    return __async(this, null, function* () {
      try {
        const userId = req.user.id;
        const id = +req.params.id;
        const comment = yield comment_service_default.getCommentById(id);
        if (!comment) {
          return next(ApiError.NotFound("Comment was not found."));
        }
        if (comment.userId !== userId) {
          return next(ApiError.UnauthorizedUser());
        }
        yield comment_service_default.deleteComment(comment.id);
        return res.json("success");
      } catch (error) {
        next(error);
      }
    });
  }
  getComments(req, res, next) {
    return __async(this, null, function* () {
      try {
        const id = +req.params.id;
        const beat = yield beat_service_default.getBeatById(id);
        const comments = yield comment_service_default.getComments(beat.id, req.query.viewed ? +req.query.viewed : 0);
        return res.json({
          comments,
          viewed: req.query.viewed ? +req.query.viewed + comments.length : comments.length
        });
      } catch (error) {
        next(error);
      }
    });
  }
};
var comment_controller_default = new CommentController();

// src/router/comment-router.ts
var router5 = (0, import_express5.Router)();
router5.get(
  "/:id",
  auth_middleware_default,
  (0, import_express_validator6.param)("id").isDecimal().bail(),
  (0, import_express_validator6.query)("viewed").if((0, import_express_validator6.query)("viewed").exists()).isDecimal().bail(),
  validation_middleware_default,
  comment_controller_default.getComments
);
router5.post("/delete/:id", (0, import_express_validator6.param)("id").isDecimal().bail(), validation_middleware_default, comment_controller_default.deleteComment);
var comment_router_default = router5;

// src/router/tag-router.ts
var import_express6 = require("express");
var import_express_validator7 = require("express-validator");

// src/services/tag-service.ts
var import_client12 = __toESM(require("@prisma/client"));
var prisma7 = new import_client12.default.PrismaClient();
var TagService = class {
  findTags(name, viewed) {
    return __async(this, null, function* () {
      const tags = yield prisma7.tag.findMany({
        where: {
          name: {
            contains: name
          }
        },
        take: 10,
        skip: viewed
      });
      return tags;
    });
  }
  getTags(viewed) {
    return __async(this, null, function* () {
      const tags = yield prisma7.tag.findMany({
        take: 10,
        skip: viewed
      });
      return tags;
    });
  }
};
var tag_service_default = new TagService();

// src/controllers/tag-controller.ts
var TagController = class {
  getTags(req, res, next) {
    return __async(this, null, function* () {
      try {
        let tags;
        if (req.query.name) {
          tags = yield tag_service_default.findTags(req.query.name, req.query.viewed ? +req.query.viewed : 0);
        } else {
          tags = yield tag_service_default.getTags(req.query.viewed ? +req.query.viewed : 0);
        }
        return res.json({
          tags,
          viewed: req.query.viewed ? +req.query.viewed + tags.length : tags.length
        });
      } catch (error) {
        next(error);
      }
    });
  }
};
var tag_controller_default = new TagController();

// src/router/tag-router.ts
var router6 = (0, import_express6.Router)();
router6.get(
  "/",
  (0, import_express_validator7.query)("viewed").if((0, import_express_validator7.query)("viewed").exists()).isDecimal().bail(),
  validation_middleware_default,
  tag_controller_default.getTags
);
var tag_router_default = router6;

// src/router/index.ts
var router7 = (0, import_express7.Router)();
router7.use("/", user_router_default);
router7.use("/author", author_router_default);
router7.use("/beat", beat_router_default);
router7.use("/media", media_router_default);
router7.use("/comment", comment_router_default);
router7.use("/tag", tag_router_default);
var router_default = router7;

// src/middlewares/error-middleware.ts
function error_middleware_default(err, req, res, next) {
  console.log(err);
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, errors: err.errors });
  }
  return res.status(500).json({ message: "An unexpected error occurred" });
}

// src/app.ts
import_dotenv.default.config();
var app = (0, import_express8.default)();
app.set("trust proxy", true);
app.use((0, import_express_fileupload.default)());
app.use(import_express8.default.json({ limit: "1000mb" }));
app.use((0, import_cookie_parser.default)());
app.use(
  (0, import_cors.default)({
    credentials: true,
    origin: process.env.CLIENT_URL
  })
);
app.use("/api", router_default);
app.use(error_middleware_default);
var app_default = app;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
