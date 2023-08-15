const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");
const { json } = require("express");

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

  // If all dishes have valid quantities, proceed to the next middleware or route handler
  next();
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

// read id

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

function read(req, res) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  res.json({ data: foundOrder });
}

function hasStatus(req, res, next) {
  const { status } = req.body.data;
  const validStatuses = ["pending", "preparing", "out-for-delivery", "delivered"];
  
  if (status === "delivered") {
    return next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  } else if (!status || status === "" || !validStatuses.includes(status)) {
    return next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
  } else {
    next();
  }
}

function update(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  const { data: { deliverTo, mobileNumber, status, dishes, id } = {} } = req.body;

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

  const deleteOrder = orders.splice(index, 1);
  res.sendStatus(204);
}

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
