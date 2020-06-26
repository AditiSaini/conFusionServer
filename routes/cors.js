const express = require("express");
const cors = require("cors");
const app = express();

//all the origins that the server is willing to accept
const whitelist = ["http://localhost:3000", "https://localhost:3443"];
var corsOptionsDelegate = (req, callback) => {
  var corsOptions;
  //if header contains an origin field, then it will be checked against the whitelisted domains
  // If present in the array, then -1 returned
  //origin is automatically added in the header by the browser
  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    //domain in the whitelist
    //client side informed, server can process this client's request
    //access control allow origin returned in the response header
    corsOptions = { origin: true };
  } else {
    //access control origin not returned
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

//allows all requests to pass through (generally used for get requests)
exports.cors = cors();
//allows certain clients to access data
exports.corsWithOptions = cors(corsOptionsDelegate);
