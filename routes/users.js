var express = require("express");
const bodyParser = require("body-parser");
var User = require("../models/user");
var passport = require("passport");

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get("/", function(req, res, next) {
  res.send("respond with a resource");
});

router.post("/signup", (req, res, next) => {
  //assumption: username and password as json string in the body of the incoming post request
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ err: err });
      } else {
        //use passport to authenticate locally
        passport.authenticate("local")(req, res, () => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json({ success: true, status: "Registration Successful!" });
        });
      }
    }
  );
});

//username and password is expected to be in the body of the post message
//when router post comes in router endpoint, then we call passport authenticate, if successful follows to the next callback else sends a failure message to the client
router.post("/login", passport.authenticate("local"), (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.json({ success: true, status: "You are successfully logged in!" });
});
//automatically adds user property to the request message which is serialized into the session

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
