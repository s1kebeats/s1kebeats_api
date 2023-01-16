import passport from "passport";
import passportJwtStrategy from "./passport-jwt-strategy";

passport.use(passportJwtStrategy);

export default passport.authenticate("jwt", { session: false });
