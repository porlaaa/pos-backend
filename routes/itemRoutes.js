const express = require("express");
const router = express.Router();

const controller = require("../controllers/itemController");
const { isVerifiedUser, requireRole } = require("../middlewares/tokenVerification");

const adminOnly = requireRole("Admin");

router.post("/", isVerifiedUser, adminOnly, controller.createItem);
router.get("/", isVerifiedUser, controller.getItems);
router.get("/:categoryId", isVerifiedUser, controller.getItemsByCategory);
router.delete("/:id", isVerifiedUser, adminOnly, controller.deleteItem);
router.put("/:id", isVerifiedUser, adminOnly, controller.updateItem);

module.exports = router;