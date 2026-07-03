const express = require("express");
const router = express.Router();

const controller = require("../controllers/itemController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");

router.post("/", isVerifiedUser, controller.createItem);
router.get("/", isVerifiedUser, controller.getItems);
router.get("/:categoryId", isVerifiedUser, controller.getItemsByCategory);
router.delete("/:id", isVerifiedUser, controller.deleteItem);
router.put("/:id", isVerifiedUser, controller.updateItem);

module.exports = router;