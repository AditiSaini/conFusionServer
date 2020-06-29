const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authenticate = require("../authenticate");
const cors = require("./cors");

const Favorites = require("../models/favorite");

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    console.log(req.user);
    Favorites.findOne({ user: req.user._id })
      .populate("user")
      .populate("dishes")
      .then(
        info => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(info);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .populate("user")
      .populate("dishes")
      .then(favorite => {
        if (favorite != null) {
          //adds a list of dishes to be added to prevent duplicates
          let allDishes = [];
          for (i = 0; i < favorite.dishes.length; i++) {
            index = favorite.dishes.indexOf(favorite.dishes[i]);
            //if the favorite dish doesnt exist
            if (index === -1) {
              allDishes.push(favorite.dishes[i]);
            }
          }
          favorite.dishes.push.apply(allDishes, req.body);
          favorite.save().then(
            favorite => {
              Favorites.findOne({ user: favorite.user._id })
                .populate("user")
                .populate("dishes")
                .then(favorite => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorite);
                });
            },
            err => next(err)
          );
        } else if (favorite == null) {
          Favorites.create({ user: req.user._id, dishes: req.body })
            .then(
              fav => {
                if (fav != null) {
                  Favorites.findOne({ user: fav.user._id })
                    .populate("user")
                    .populate("dishes")
                    .then(favorite => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(favorite);
                    });
                }
              },
              err => {
                next(err);
              }
            )
            .catch(err => next(err));
        }
      })
      .catch(err => {
        next(err);
      });
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(favorite => {
        if (favorite !== null) {
          Favorites.remove({ _id: favorite._id }).then(fav => {
            console.log("Update Status");
            console.log(fav);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          });
        } else if (favorite === null) {
          console.log(favorite);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(null);
        }
      })
      .catch(err => {
        next(err);
      });
  });

favoriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    let dishId = req.params.dishId;
    Favorites.findOne({ user: req.user._id })
      .then(favorite => {
        if (favorite != null) {
          let index = favorite.dishes.indexOf(dishId);
          for (i = 0; i < favorite.dishes.length; i++) {
            index = favorite.dishes[i]._id == dishId;
            if (index) {
              break;
            }
          }
          if (index === true) {
            console.log("Dish in array");
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          } else if (index === false) {
            console.log("Dish not in array");
            favorite.dishes.push(dishId);
            favorite.save().then(
              favorite => {
                Favorites.findOne({ user: favorite.user._id }).then(
                  favorite => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                  }
                );
              },
              err => next(err)
            );
          }
        } else if (favorite == null) {
          Favorites.create({ user: req.user._id, dishes: [req.params.dishId] })
            .then(
              fav => {
                if (fav != null) {
                  Favorites.findOne({ user: fav.user._id }).then(favorite => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                  });
                }
              },
              err => {
                next(err);
              }
            )
            .catch(err => next(err));
        }
      })
      .catch(err => {
        next(err);
      });
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    let dishId = req.params.dishId;
    Favorites.findOne({ user: req.user._id })
      .then(favorite => {
        if (favorite != null) {
          let index = favorite.dishes.indexOf(dishId);
          for (i = 0; i < favorite.dishes.length; i++) {
            index = favorite.dishes[i]._id == dishId;
            index_num = i;
            if (index) {
              break;
            }
          }
          if (index === true) {
            console.log("Dish in array");
            //remove the dish
            favorite.dishes.splice(index_num, 1);
            favorite.save().then(
              favorite => {
                console.log(favorite.dishes.length);
                if (favorite.dishes.length === 0) {
                  Favorites.remove({ _id: favorite._id }).then(
                    fav => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(null);
                    },
                    err => next(err)
                  );
                } else {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorite);
                }
              },
              err => next(err)
            );
          } else if (index === false) {
            console.log("Dish not in array");
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          }
        } else if (favorite == null) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(null);
        }
      })
      .catch(err => {
        next(err);
      });
  });

module.exports = favoriteRouter;
