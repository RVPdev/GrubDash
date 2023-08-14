const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function list(req, res) {
  res.json({ data: dishes });
}

function hasName(req, res, next) {
  const { data: { name } = {} } = req.body;
  if (!name || name === "") {
    return next({
      status: 400,
      message: "Dish must include a name",
    });
  }
  next();
}

function hasDescription(req, res, next) {
  const { data: { description } = {} } = req.body;
  if (!description || description === "") {
    return next({
      status: 400,
      message: "Dish must include a description",
    });
  }
  next();
}

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId,
    name,
    description,
    price,
    image_url,
  };

  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

module.exports = {
  create: [hasName, hasDescription, create],
  list,
};
