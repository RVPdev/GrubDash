const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function list(req, res) {
  res.json({ data: orders });
}

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

module.exports = {
  create: [hasDeliver, hasNumber, hasDishes, create],
  list,
};
