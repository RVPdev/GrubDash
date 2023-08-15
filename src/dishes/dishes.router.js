// Importing required modules
const router = require("express").Router();

// Importing the dishes controller to handle the respective routes
const controller = require("./dishes.controller");

// Middleware to handle not allowed methods
const methodNotAllowed = require("../errors/methodNotAllowed");

// Setting up the base route for dishes
router
  .route("/")
  // Route to list all dishes
  .get(controller.list)
  // Route to create a new dish
  .post(controller.create)
  // For any other HTTP methods on this route, methodNotAllowed middleware is triggered
  .all(methodNotAllowed);

// Setting up the route for specific dish using dishId
router
  .route("/:dishId")
  // Route to retrieve a specific dish by its ID
  .get(controller.read)
  // Route to update a specific dish by its ID
  .put(controller.update)
  // For any other HTTP methods on this route, methodNotAllowed middleware is triggered
  .all(methodNotAllowed);

// Exporting the router to be used in the main app/server
module.exports = router;
