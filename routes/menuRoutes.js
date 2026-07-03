const express = require("express");
const router = express.Router();

const {
  createMenu,
  getMenus,
  deleteMenu,
  updateMenu,
} = require("../controllers/menuController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");

// Menu
router.post("/", isVerifiedUser, createMenu);
router.get("/", isVerifiedUser, getMenus);
router.delete("/:menuId", isVerifiedUser, deleteMenu);
router.put("/:menuId", isVerifiedUser, updateMenu);

module.exports = router;