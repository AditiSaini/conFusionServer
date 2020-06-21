var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");
var FileStore = require("session-file-store")(session);
var passport = require("passport");
var authenticate = require("./authenticate");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var dishRouter = require("./routes/dishRouter");
var promoRouter = require("./routes/promoRouter");
var leaderRouter = require("./routes/leaderRouter");

const mongoose = require("mongoose");

//Connecting to the mongodb server
const url = "mongodb://localhost:27017/conFusion";
const connect = mongoose.connect(url);
connect
  .then(db => {
    console.log("Connected correctly to the server");
  })
  .catch(err => {
    console.log(err);
  });

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//we will be using signed cookies
// app.use(cookieParser("12345-67890-09876-54321"));
//check if cookie setup -> no -> authenticate -> set cookie -> check if cookie is user admin -> allow request

//we will be using session instead of a cookie parser
app.use(
  session({
    name: "session-id",
    secret: "12345-67890-09876-54321",
    saveUninitialized: false,
    resave: false,
    store: new FileStore()
  })
);
//gives -> req.session

//if the user is logged in automatically serialized user info and stores in the session
//so next time request comes, req.User property can be extracted from the request message
app.use(passport.initialize());
app.use(passport.session());

//so that an incoming user can access these resources before they are authenticated
app.use("/", indexRouter);
app.use("/users", usersRouter);

//Now auth will be modified to use cookies instead of using auth header
//user has to be authenticated before the server content can be accessed
function auth(req, res, next) {
  // prev: console.log(req.header);
  // prev1: console.log(req.signedCookies);
  console.log(req.user);

  //user is a property in signed cookies
  //if no user means, user has to authenticate himself
  //prev: if (!req.signedCookies.user) {
  if (!req.user) {
    var err = new Error("You are not authenticated!");
    err.status = 403;
    return next(err);
  } else {
    //allows request to pass through
    next();
  }
}
app.use(auth);

//allows to serve static data to be displayed from public and we want to do authentication before any kind of data is accessed
app.use(express.static(path.join(__dirname, "public")));

//protected resources only when you sign in
app.use("/dishes", dishRouter);
app.use("/promotions", promoRouter);
app.use("/leaders", leaderRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler (sent to the client)
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

//To run mongodb server: mongod --dbpath=data --bind_ip 127.0.0.1
