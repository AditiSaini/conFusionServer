const express = require("express");
const bodyParser = require("body-parser");

const dishRouter = express.Router();
dishRouter.use(bodyParser.json());

// mounting of the dish router has to be done in the index.js file
dishRouter
  .route("/")
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    //It will look for specific conditions that matches /dishes
    next();
  })
  .get((req, res, next) => {
    //req and res passed on to this function (because of next) with modified res object
    res.end("Will send all the dishes to you!");
  })
  .post((req, res, next) => {
    //req body will contain information
    //req.body is accessible because of body-parser
    //Expectation: name and description property in the post request sent by the client
    res.end(
      "Will add the dish: " +
        req.body.name +
        " with details: " +
        req.body.description
    );
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /dishes");
  })
  .delete((req, res, next) => {
    res.end("Deleting all the dishes!");
  });

dishRouter
  .route("/:dishId")
  .get((req, res, next) => {
    res.end(
      "Will send the details of the dish: " + req.params.dishId + " to you!"
    );
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end("POST operation not supported on /dishes/" + req.params.dishId);
    req.body.description;
  })
  .put((req, res, next) => {
    res.write("Updating the dish: " + req.params.dishId + "\n");
    res.end(
      "Will update the dish: " +
        req.body.name +
        " with details: " +
        req.body.description
    );
  })
  .delete((req, res, next) => {
    res.end("Deleting the dish: " + req.params.dishId);
  });

module.exports = dishRouter;
