//Schema that tracks username and password
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");

var User = new Schema({
  firstname: {
    type: String,
    default: ""
  },
  lastname: {
    type: String,
    default: ""
  },
  //user with fb id wont have a password
  facebookId: String,
  admin: {
    type: Boolean,
    default: false
  }
});

//Automatically adds in the support for username and hashed stored password
User.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", User);
