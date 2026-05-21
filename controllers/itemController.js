const Item = require("../models/itemModel");

const createItem = async (req, res, next) => {
  try {
    const { name, price, category, image } = req.body;

    const item = await Item.create({ name, price, category, image: image || "" });

    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

const getItemsByCategory = async (req, res, next) => {
  try {
    const items = await Item.find({ category: req.params.categoryId });

    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

const getItems = async (req, res, next) => {
  try {
    const items = await Item.find();

    res.json({
      success: true,
      data: items
    });
  } catch (err) {
    next(err);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    await Item.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Deleted"
    });
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const { name, price, image } = req.body;
    const update = { name, price };
    if (image !== undefined) update.image = image;

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createItem,
  getItems,
  getItemsByCategory,
  deleteItem,
  updateItem
};