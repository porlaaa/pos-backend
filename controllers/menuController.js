const Menu = require("../models/menuModel");
const Item = require("../models/itemModel");
const createHttpError = require("http-errors");
const { Types } = require("mongoose");

const validateObjectId = (id, label = "id") => {
  if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
    throw createHttpError(400, `Invalid ${label}`);
  }
};

const normalizeMenuPayload = (payload = {}, { partial = false } = {}) => {
  const menuData = {};

  if (!partial || payload.name !== undefined) {
    const name = typeof payload.name === "string" ? payload.name.trim() : "";

    if (!name) {
      throw createHttpError(400, "Menu name is required");
    }

    menuData.name = name;
  }

  if (payload.image !== undefined) {
    if (typeof payload.image !== "string") {
      throw createHttpError(400, "Menu image must be a string");
    }

    menuData.image = payload.image.trim();
  }

  if (partial && Object.keys(menuData).length === 0) {
    throw createHttpError(400, "No valid menu fields provided");
  }

  return menuData;
};

// CREATE
const createMenu = async (req, res, next) => {
  try {
    const menuData = normalizeMenuPayload(req.body);
    const menu = await Menu.create(menuData);

    res.status(201).json({ success: true, data: menu });
  } catch (err) {
    next(err);
  }
};

// GET
const getMenus = async (req, res, next) => {
  try {
    const menus = await Menu.find();
    res.json({ success: true, data: menus });
  } catch (err) {
    next(err);
  }
};

// DELETE
const deleteMenu = async (req, res, next) => {
  try {
    const { menuId } = req.params;
    validateObjectId(menuId, "menu id");

    const menu = await Menu.findByIdAndDelete(menuId);
    if (!menu) {
      throw createHttpError(404, "Menu not found");
    }

    await Item.deleteMany({ category: menuId });

    res.json({ success: true, message: "Menu & items deleted" });
  } catch (error) {
    next(error);
  }
};

// UPDATE
const updateMenu = async (req, res, next) => {
  try {
    const { menuId } = req.params;
    validateObjectId(menuId, "menu id");

    const menuData = normalizeMenuPayload(req.body, { partial: true });
    const updatedMenu = await Menu.findByIdAndUpdate(menuId, menuData, {
      new: true,
      runValidators: true,
    });

    if (!updatedMenu) {
      throw createHttpError(404, "Menu not found");
    }

    res.json({ success: true, data: updatedMenu });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createMenu,
  getMenus,
  deleteMenu,
  updateMenu,
};
