const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const findUserById = require('./usersServices').findUserById;

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'сгенерируй сикрет',
}

passport.use(new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
        const user = await findUserById(jwtPayload.sub)
        return done(null, user);
    } catch (err) { 
        return done(err, false);
    }
}))

module.exports = passport;