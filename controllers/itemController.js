const Item = require("../models/itemModel");
const Menu = require("../models/menuModel");
const createHttpError = require("http-errors");
const { Types } = require("mongoose");

const validateObjectId = (id, label = "id") => {
  if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
    throw createHttpError(400, `Invalid ${label}`);
  }
};

const normalizePositiveNumber = (value, label) => {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    throw createHttpError(400, `${label} must be a positive number`);
  }

  return numberValue;
};

const normalizeItemPayload = async (payload = {}, { partial = false } = {}) => {
  const itemData = {};

  if (!partial || payload.name !== undefined) {
    const name = typeof payload.name === "string" ? payload.name.trim() : "";

    if (!name) {
      throw createHttpError(400, "Item name is required");
    }

    itemData.name = name;
  }

  if (!partial || payload.price !== undefined) {
    itemData.price = normalizePositiveNumber(payload.price, "Item price");
  }

  if (!partial || payload.category !== undefined) {
    validateObjectId(payload.category, "category id");

    const categoryExists = await Menu.exists({ _id: payload.category });
    if (!categoryExists) {
      throw createHttpError(404, "Menu category not found");
    }

    itemData.category = payload.category;
  }

  if (payload.image !== undefined) {
    if (typeof payload.image !== "string") {
      throw createHttpError(400, "Item image must be a string");
    }

    itemData.image = payload.image.trim();
  }

  if (partial && Object.keys(itemData).length === 0) {
    throw createHttpError(400, "No valid item fields provided");
  }

  return itemData;
};

const createItem = async (req, res, next) => {
  try {
    const itemData = await normalizeItemPayload(req.body);
    const item = await Item.create(itemData);

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
    validateObjectId(req.params.categoryId, "category id");

    const categoryExists = await Menu.exists({ _id: req.params.categoryId });
    if (!categoryExists) {
      throw createHttpError(404, "Menu category not found");
    }

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
    validateObjectId(req.params.id);

    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      throw createHttpError(404, "Item not found");
    }

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
    validateObjectId(req.params.id);
    const update = await normalizeItemPayload(req.body, { partial: true });

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );

    if (!item) {
      throw createHttpError(404, "Item not found");
    }

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
