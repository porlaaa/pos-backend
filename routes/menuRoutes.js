const express = require("express");
const router = express.Router();

const {
  createMenu,
  getMenus,
  deleteMenu,
  updateMenu,
} = require("../controllers/menuController");
const { isVerifiedUser, requireRole } = require("../middlewares/tokenVerification");

const adminOnly = requireRole("Admin");

// Menu
router.post("/", isVerifiedUser, adminOnly, createMenu);
router.get("/", isVerifiedUser, getMenus);
router.delete("/:menuId", isVerifiedUser, adminOnly, deleteMenu);
router.put("/:menuId", isVerifiedUser, adminOnly, updateMenu);

module.exports = router;