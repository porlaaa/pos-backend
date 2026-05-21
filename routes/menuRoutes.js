const express = require("express");
const router = express.Router();

const {
  createMenu,
  getMenus,
  deleteMenu,
  updateMenu,
} = require("../controllers/menuController");

// Menu
router.post("/", createMenu);
router.get("/", getMenus);
router.delete("/:menuId", deleteMenu);
router.put("/:menuId", updateMenu);

module.exports = router;