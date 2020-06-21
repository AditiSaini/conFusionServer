const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authenticate = require("../authenticate");

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
  //only allow post request if the user is authenticated
  .post(authenticate.verifyUser, (req, res, next) => {
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
  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /dishes");
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
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
  .post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("POST operation not supported on /dishes/" + req.params.dishId);
  })
  .put(authenticate.verifyUser, (req, res, next) => {
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
  .delete(authenticate.verifyUser, (req, res, next) => {
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

dishRouter
  .route("/:dishId/comments")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        dish => {
          if (dish != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish.comments);
          } else {
            err = new Error("Dish " + req.params.dishId) + " not found";
            err.statusCode = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    //take dish id, return dish and  get the comment from the body to add it to the dish
    Dishes.findById(req.params.dishId)
      .then(
        dish => {
          if (dish != null) {
            dish.comments.push(req.body);
            dish.save().then(
              dish => {
                //if the dish gets saved
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                //send the dish with updated comments to teh user
                res.json(dish);
              },
              err => next(err)
            );
          } else {
            err = new Error("Dish " + req.params.dishId) + " not found";
            err.statusCode = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      "PUT operation not supported on /dishes/" +
        req.params.dishId +
        "/comments"
    );
  })
  //remove all the comments from the dish
  .delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        dish => {
          if (dish != null) {
            for (var i = dish.comments.length - 1; i >= 0; i--) {
              //accesses the subdocument, then id of subdocument is used to remove one element from the subdocuments
              dish.comments.id(dish.comments[i]._id).remove();
            }
            dish.save().then(
              dish => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(dish);
              },
              err => next(err)
            );
          } else {
            err = new Error("Dish " + req.params.dishId) + " not found";
            err.statusCode = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

dishRouter
  .route("/:dishId/comments/:commentId")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        dish => {
          //3 conds
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish.comments.id(req.params.commentId));
          } else if (dish == null) {
            err = new Error("Dish " + req.params.dishId) + " not found";
            err.statusCode = 404;
            return next(err);
            //if comment doesnt exist
          } else {
            err = new Error("Comment " + req.params.commentId) + " not found";
            err.statusCode = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      "POST operation not supported on /dishes/" +
        req.params.dishId +
        "/comments/" +
        req.params.commentId
    );
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        dish => {
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            //Comment can be changed but author cant be changed
            if (req.body.rating) {
              dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
              dish.comments.id(req.params.commentId).comment = req.body.comment;
            }
            dish.save().then(
              dish => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(dish);
              },
              err => next(err)
            );
          } else if (dish == null) {
            err = new Error("Dish " + req.params.dishId) + " not found";
            err.statusCode = 404;
            return next(err);
          } else {
            err = new Error("Comment " + req.params.commentId) + " not found";
            err.statusCode = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        dish => {
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            dish.comments.id(req.params.commentId).remove();
            dish.save().then(
              dish => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(dish);
              },
              err => next(err)
            );
          } else if (dish == null) {
            err = new Error("Dish " + req.params.dishId) + " not found";
            err.statusCode = 404;
            return next(err);
          } else {
            err = new Error("Comment " + req.params.commentId) + " not found";
            err.statusCode = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

module.exports = dishRouter;
