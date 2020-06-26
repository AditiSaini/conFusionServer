var express = require("express");
const bodyParser = require("body-parser");
var User = require("../models/user");
var passport = require("passport");
var authenticate = require("../authenticate");
const cors = require("./cors");

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get(
  "/",
  cors.corsWithOptions,
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  function(req, res, next) {
    User.find({})
      .then(
        users => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(users);
        },
        err => next(err)
      )
      .catch(err => next(err));
  }
);

router.post("/signup", cors.corsWithOptions, (req, res, next) => {
  //assumption: username and password as json string in the body of the incoming post request
  //update user info: db.users.update({"username": "admin"}, {$set: {"admin": true}})
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ err: err });
      } else {
        //we ensure that the username and lastname are registered only after successful registration
        if (req.body.firstname) user.firstname = req.body.firstname;
        if (req.body.lastname) user.lastname = req.body.lastname;
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ err: err });
          }
          //use passport to authenticate locally
          passport.authenticate("local")(req, res, () => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: true, status: "Registration Successful!" });
          });
        });
      }
    }
  );
});

//username and password is expected to be in the body of the post message
//when router post comes in router endpoint, then we call passport authenticate, if successful follows to the next callback else sends a failure message to the client
//passport.auth(local) adds user property to request
router.post(
  "/login",
  cors.corsWithOptions,
  passport.authenticate("local"),
  (req, res) => {
    //getToken is from the authenticate.js file and payload of user id is passed
    var token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    //token gets added to the returned json
    res.json({
      success: true,
      token: token,
      status: "You are successfully logged in!"
    });
  }
);
//automatically adds user property to the request message which is serialized into the session

//no need to send any information in the body of the request, hence, get request
router.get("/logout", cors.corsWithOptions, (req, res, next) => {
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
