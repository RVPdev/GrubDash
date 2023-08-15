// Importing the necessary modules for routing
const router = require("express").Router();

// Importing the controller for the orders
const controller = require("./orders.controller");

// TODO: Implement the /orders routes needed to make the tests pass

// Router for the base /orders route
router
  .route("/")
  // GET request handler to list all orders
  .get(controller.list)
  // POST request handler to create a new order
  .post(controller.create);

// Router for the /orders/:orderId route
router
  .route("/:orderId")
  // GET request handler to retrieve a specific order by ID
  .get(controller.read)
  // PUT request handler to update a specific order by ID
  .put(controller.update)
  // DELETE request handler to delete a specific order by ID
  .delete(controller.delete);

// Exporting the router to be used in the main application
module.exports = router;
