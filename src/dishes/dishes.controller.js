const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// list dishes
function list(req, res) {
  res.json({ data: dishes });
}

// validate the create dish
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

// read handler

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

function read(req, res) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  res.json({ data: foundDish });
}

// update handler
function update(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  const { data: { name, description, price, image_url, id } = {} } = req.body;

  if(id && id !== dishId){
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

module.exports = {
  create: [hasName, hasDescription, hasPrice, hasImage, create],
  list,
  read: [dishExist, read],
  update: [dishExist, hasName, hasDescription, hasPrice, hasImage, update],
};
