const Menu = require("../models/menuModel");
const Item = require("../models/itemModel");

// CREATE
const createMenu = async (req, res, next) => {
  try {
    const menu = await Menu.create(req.body);
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

    await Menu.findByIdAndDelete(menuId);
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
    const updatedMenu = await Menu.findByIdAndUpdate(menuId, req.body, { new: true });
    if (!updatedMenu) {
      return res.status(404).json({ success: false, message: "Menu not found" });
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