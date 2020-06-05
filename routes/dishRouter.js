const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

//Aim is to interact dish (with the dish model) router with the server using mongoose
const Dishes = require("../models/dishes");

const dishRouter = express.Router();
dishRouter.use(bodyParser.json());

// mounting of the dish router has to be done in the index.js file
dishRouter
  .route("/")
  .get((req, res, next) => {
    //req and res passed on to this function (because of next) with modified res object
    //Aim: return all dishes from the model to the client
    Dishes.find({})
      .then(
        dishes => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          //Takes a string and puts in the body of the response and sends as a json response to the client
          res.json(dishes);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post((req, res, next) => {
    //req body will contain information
    //req.body is accessible because of body-parser
    //Expectation: name and description property in the post request sent by the client
    Dishes.create(req.body)
      .then(
        dish => {
          console.log("Dish created", dish);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /dishes");
  })
  .delete((req, res, next) => {
    Dishes.remove({})
      .then(
        resp => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          //send the response to the client
          res.json(resp);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

dishRouter
  .route("/:dishId")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        dishes => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          //Takes a string and puts in the body of the response and sends as a json response to the client
          res.json(dishes);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end("POST operation not supported on /dishes/" + req.params.dishId);
    req.body.description;
  })
  .put((req, res, next) => {
    Dishes.findByIdAndUpdate(
      req.params.dishId,
      {
        $set: req.body
      },
      //so find by id updates the updated dish as a json reply
      { new: true }
    )
      .then(
        dish => {
          console.log("Dish updated", dish);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .delete((req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
      .then(
        resp => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          //send the response to the client
          res.json(resp);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

module.exports = dishRouter;
