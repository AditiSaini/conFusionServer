var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");
var FileStore = require("session-file-store")(session);
var passport = require("passport");
var authenticate = require("./authenticate");
var config = require("./config");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var dishRouter = require("./routes/dishRouter");
var promoRouter = require("./routes/promoRouter");
var leaderRouter = require("./routes/leaderRouter");
var uploadRouter = require("./routes/uploadRouter");
var favoriteRouter = require("./routes/favoriteRouter");

const mongoose = require("mongoose");

//Connecting to the mongodb server
const url = config.mongoUrl;
const connect = mongoose.connect(url);
connect
  .then(db => {
    console.log("Connected correctly to the server");
  })
  .catch(err => {
    console.log(err);
  });

var app = express();

//redirect to a secure port on server from http to https
app.all("*", (req, res, next) => {
  //if incoming request is already secure (secure is a flag in request)
  if (req.secure) {
    return next();
  } else {
    //redirect to the secure port
    //remove ssl cert verfication in postman to get it to work there
    res.redirect(
      307,
      "https://" + req.hostname + ":" + app.get("secPort") + req.url
    );
    //307: temporary redirect: resource requested has been moved to another url. The method and the body of the original request has been reused to the redirected url
  }
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//if the user is logged in automatically serialized user info and stores in the session
//so next time request comes, req.User property can be extracted from the request message
app.use(passport.initialize());
//so that an incoming user can access these resources before they are authenticated
app.use("/", indexRouter);
app.use("/users", usersRouter);

//Now auth will be modified to use cookies instead of using auth header
//user has to be authenticated before the server content can be accessed
//allows to serve static data to be displayed from public and we want to do authentication before any kind of data is accessed
app.use(express.static(path.join(__dirname, "public")));

//allow get requests from any user but put, post and delete from auth users
//protected resources only when you sign in
app.use("/dishes", dishRouter);
app.use("/promotions", promoRouter);
app.use("/leaders", leaderRouter);
app.use("/imageUpload", uploadRouter);
app.use("/favorites", favoriteRouter);

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
  res.status(err.statusCode || 500);
  res.render("error");
});

module.exports = app;

//To run mongodb server: mongod --dbpath=data --bind_ip 127.0.0.1
