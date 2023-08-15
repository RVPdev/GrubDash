const path = require("path");

// Loading the existing orders data from the data file
const orders = require(path.resolve("src/data/orders-data"));

// Utility function to generate a unique ID for new orders
const nextId = require("../utils/nextId");
const { json } = require("express");

// Endpoint handlers for the /orders routes

// Lists all the orders
function list(req, res) {
  res.json({ data: orders });
}

// Middleware to validate the presence of 'deliverTo' in the request body
function hasDeliver(req, res, next) {
  const { deliverTo } = req.body.data;
  if (!deliverTo || deliverTo === "") {
    return next({
      status: 400,
      message: "Order must include a deliverTo",
    });
  }
  next();
}

// Middleware to validate the presence of 'mobileNumber' in the request body
function hasNumber(req, res, next) {
  const { mobileNumber } = req.body.data;
  if (!mobileNumber || mobileNumber === "") {
    return next({
      status: 400,
      message: "Order must include a mobileNumber",
    });
  }
  next();
}

// Middleware to validate the presence and format of 'dishes' in the request body
function hasDishes(req, res, next) {
  const { dishes } = req.body.data;
  if (!dishes) {
    return next({
      status: 400,
      message: "Order must include a dish",
    });
  } else if (dishes.length === 0 || !Array.isArray(dishes)) {
    return next({
      status: 400,
      message: "Order must include at least one dish",
    });
  } else {
    next();
  }
}

// Middleware to validate the 'quantity' of each dish in the request body
function hasQuantity(req, res, next) {
  const { dishes } = req.body.data;

  for (let i = 0; i < dishes.length; i++) {
    const dish = dishes[i];
    if (
      !dish.quantity ||
      typeof dish.quantity !== "number" ||
      dish.quantity <= 0
    ) {
      return next({
        status: 400,
        message: `Dish ${i} must have a quantity that is an integer greater than 0`,
      });
    }
  }
  next();
}

// Handler to create a new order
function create(req, res) {
  const { deliverTo, mobileNumber, status, dishes } = req.body.data;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };

  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

// Middleware to check if the order with the provided ID exists
function orderExist(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    return next();
  }
  next({
    status: 404,
    message: `Order does not exist: ${orderId}.`,
  });
}

// Handler to retrieve a single order by ID
function read(req, res) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  res.json({ data: foundOrder });
}

// Middleware to validate the status of the order in the request body
function hasStatus(req, res, next) {
  const { status } = req.body.data;
  const validStatuses = [
    "pending",
    "preparing",
    "out-for-delivery",
    "delivered",
  ];

  if (status === "delivered") {
    return next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  } else if (!status || status === "" || !validStatuses.includes(status)) {
    return next({
      status: 400,
      message: "Order must have a valid status",
    });
  } else {
    next();
  }
}

// Handler to update an existing order by ID
function update(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  const { data: { deliverTo, mobileNumber, status, dishes, id } = {} } =
    req.body;

  if (id && id !== orderId) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
    });
  }

  foundOrder.deliverTo = deliverTo;
  foundOrder.mobileNumber = mobileNumber;
  foundOrder.status = status;
  foundOrder.dishes = dishes;

  res.json({ data: foundOrder });
}

// Handler to delete an order by ID
function destroy(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  const index = orders.findIndex((order) => order.id === orderId);

  if (foundOrder.status !== "pending") {
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending.",
    });
  }

  orders.splice(index, 1);
  res.sendStatus(204);
}

// Exporting the handlers to be used in the routes
module.exports = {
  create: [hasDeliver, hasNumber, hasDishes, hasQuantity, create],
  list,
  read: [orderExist, read],
  update: [
    hasDeliver,
    hasNumber,
    hasDishes,
    hasQuantity,
    hasStatus,
    orderExist,
    update,
  ],
  delete: [orderExist, destroy],
};
