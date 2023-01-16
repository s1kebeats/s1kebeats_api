import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import userService from "../services/user-service";

export default new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_ACCESS_SECRET,
  },
  async (jwtPayload, done) => {
    try {
      const user = await userService.getUserById(jwtPayload.id);
      if (user != null) {
        done(null, user);
        return;
      }
      done(null, false);
      return;
    } catch (error) {
      done(error, false);
    }
  }
);
