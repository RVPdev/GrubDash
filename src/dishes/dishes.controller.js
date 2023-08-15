// Importing necessary modules
const path = require("path");

// Loading the dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Utility function for generating unique IDs
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// Handler to list all dishes
function list(req, res) {
  res.json({ data: dishes });
}

// Middleware to validate the presence of a name in the dish
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

// Middleware to validate the presence of a description in the dish
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

// Middleware to validate the price of the dish
function hasPrice(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (!price || price <= 0 || !Number.isInteger(price)) {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }
  next();
}

// Middleware to validate the presence of an image URL in the dish
function hasImage(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (!image_url || image_url === "") {
    return next({
      status: 400,
      message: "Dish must include a image_url",
    });
  }
  next();
}

// Handler to create a new dish
function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };

  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

// Middleware to check if the dish exists based on its ID
function dishExist(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}.`,
  });
}

// Handler to retrieve a specific dish by its ID
function read(req, res) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  res.json({ data: foundDish });
}

// Handler to update a dish
function update(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  const { data: { name, description, price, image_url, id } = {} } = req.body;

  if (id && id !== dishId) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }

  foundDish.name = name;
  foundDish.description = description;
  foundDish.price = price;
  foundDish.image_url = image_url;

  res.json({ data: foundDish });
}

// Exporting the handlers to be used in the router
module.exports = {
  create: [hasName, hasDescription, hasPrice, hasImage, create],
  list,
  read: [dishExist, read],
  update: [dishExist, hasName, hasDescription, hasPrice, hasImage, update],
};
