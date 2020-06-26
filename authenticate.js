var passport = require("passport");
//exports strategy used for application
var LocalStrategy = require("passport-local").Strategy;
var User = require("./models/user");
var JwtStrategy = require("passport-jwt").Strategy;
var ExtractJwt = require("passport-jwt").ExtractJwt;
var jwt = require("jsonwebtoken");
var FacebookTokenStrategy = require("passport-facebook-token");

//configuration file of the project
var config = require("./config");

//Incoming request should have username and password in the body as json string
//passport takes it from the body for verification
//User.authenticate() provides authentication for local strategy
exports.local = passport.use(new LocalStrategy(User.authenticate()));
//since sessions are used, user information is serialized
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//user is a json object
///this function creates a json token to be added to subsequent requests by client
exports.getToken = function(user) {
  //3600 seconds = 1 hour (generally a few days in real applications)
  return jwt.sign(user, config.secretKey, { expiresIn: 3600 });
};

//options for jwt based strategy
var opts = {};
//how jwt token is extracted from the incoming client request
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
//secret key in strategy for signing
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    //done is the callback provided by passport
    //then done provides params to passport to supply to the request message
    console.log("JWT payload: ", jwt_payload);
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
      if (err) {
        //callback that passport passes into your strategy
        //since its an error, no user value passed
        return done(err, false);
      } else if (user) {
        //err is null
        return done(null, user);
      } else {
        //cant find user or got an error
        done(null, false);
        //probable step => create a new user
      }
    });
  })
);

//no sessions in this case (just a token based auth)
exports.verifyUser = passport.authenticate("jwt", { session: false });

exports.verifyAdmin = (req, res, next) => {
  if (req.user.admin === true) {
    return next();
  }
  err = new Error("You are not authorised to perform this operation");
  err.statusCode = 403;
  return next(err);
};

exports.facebookPassport = passport.use(
  new FacebookTokenStrategy(
    {
      clientID: config.facebook.clientId,
      clientSecret: config.facebook.clientSecret
    },
    (accessToken, refreshToken, profile, done) => {
      //checks if the user has logged in before
      User.findOne({ facebookId: profile.id }, (err, user) => {
        if (err) {
          return done(err, false);
        }
        if (!err && user !== null) {
          //found a user that has logged in earlier with that fb id
          return done(null, user);
        } else {
          //user doesnt exist so a new user has to be created
          user = new User({ username: profile.displayName });
          user.facebookId = profile.id;
          user.firstname = profile.name.givenName;
          user.lastname = profile.name.familyName;
          user.save((err, user) => {
            if (err) {
              return done(err, false);
            } else {
              return done(null, user);
            }
          });
        }
      });
    }
  )
);
