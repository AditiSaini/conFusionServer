var express = require("express");
const bodyParser = require("body-parser");
var User = require("../models/user");
var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get("/", function(req, res, next) {
  res.send("respond with a resource");
});

router.post("/signup", (req, res, next) => {
  //assumption: username and password as json string in the body of the incoming post request
  //check if the user with the username exists
  User.findOne({ username: req.body.username })
    .then(user => {
      if (user != null) {
        var err = new Error("User " + req.body.username + " already exists!");
        err.status = 403;
        next(err);
      } else {
        return User.create({
          //default admin flag is false
          username: req.body.username,
          password: req.body.password
        });
      }
    })
    .then(
      user => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ status: "Registration Successful!", user: user });
      },
      //if promise doesnt resolve successfully
      err => {
        next(err);
      }
    )
    .catch(err => next(err));
});

router.post("/login", (req, res, next) => {
  if (!req.session.user) {
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
    var auth = new Buffer.from(authHeader.split(" ")[1], "base64")
      .toString()
      .split(":");
    var username = auth[0];
    var password = auth[1];
    //search in db to check if the user exists and matches the password set
    User.findOne({ username: username })
      .then(user => {
        if (user == null) {
          var err = new Error("Username does not exist");
          err.status = 403;
          return next(err);
        } else if (user.password != password) {
          var err = new Error("Username does not exist");
          err.status = 403;
          return next(err);
        } else if (user.username === username && user.password === password) {
          //set up the cookie here with name user in the outgoing response message so that the next incoming requests have the cookie
          //That's why we were checking at user property earlier with value admin
          //prev: res.cookie("user", "admin", { signed: true });
          req.session.user = "authenticated";
          //from the auth, request passes on to the next set of middleware that services the request
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/plain");
          res.end("You are authenticated");
          next();
        }
      })
      .catch(err => next(err));
  } else {
    //when the user is already logged in
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("You are already authenticated!");
  }
});

//no need to send any information in the body of the request, hence, get request
router.get("/logout", (req, res, next) => {
  if (req.session) {
    //delete the cookie session info from the server side
    req.session.destroy();
    //deletes the cookie from the client side
    res.clearCookie("session-id");
    //redirect the user to the homepage
    res.redirect("/");
  } else {
    var err = new Error("You are not logged in!");
    err.status = 403;
    next(err);
  }
});

module.exports = router;
