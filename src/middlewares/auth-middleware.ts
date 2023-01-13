import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import userService from "../services/user-service";

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    },
    async (jwtPayload, done) => {
      try {
        const user = await userService.getUserById(jwtPayload.id);
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport.authenticate("jwt", { session: false });