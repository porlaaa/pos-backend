const express = require("express");
const router = express.Router();

const controller = require("../controllers/itemController");

router.post("/", controller.createItem);
router.get("/", controller.getItems);
router.get("/:categoryId", controller.getItemsByCategory);
router.delete("/:id", controller.deleteItem);
router.put("/:id", controller.updateItem);

module.exports = router;