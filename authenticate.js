var passport = require("passport");
//exports strategy used for application
var LocalStrategy = require("passport-local").Strategy;
var User = require("./models/user");

//Incoming request should have username and password in the body as json string
//passport takes it from the body for verification
//User.authenticate() provides authentication for local strategy
passport.use(new LocalStrategy(User.authenticate()));
//since sessions are used, user information is serialized
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
