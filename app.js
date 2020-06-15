var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

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
app.use(cookieParser());
//user has to be authenticated before the server content can be accessed

function auth(req, res, next) {
  console.log(req.header);

  var authHeader = req.headers.authorization;
  //username or password is null
  if (!authHeader) {
    var err = new Error("You are not authenticated");
    res.setHeader("WWW-Authenticate", "Basic");
    err.status = 401;
    //skip over all rest and go to the error handler that constructs the reply message to be sent to the client
    return next(err);
  }

  //Basic username:password in base 64
  //gets the rest of the base64 encoded string containing username and password
  var auth = new Buffer(authHeader.split(" ")[1], "base64")
    .toString()
    .split(":");
  var username = auth[0];
  var password = auth[1];

  if (username === "admin" && password === "password") {
    //from the auth, request passes on to the next set of middleware that services the request
    next();
  } else {
    var err = new Error("You are not authenticated");
    res.setHeader("WWW-Authenticate", "Basic");
    err.status = 401;
    return next(err);
  }
}
app.use(auth);

//allows to serve static data to be displayed from public and we want to do authentication before any kind of data is accessed
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
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
