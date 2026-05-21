const express = require("express");

const router = express.Router();

const {
  addTable,
  getTables,
  updateTable,
  deleteTable,
} = require("../controllers/tableController");

router.post("/", addTable);
router.get("/", getTables);
router.put("/:id", updateTable);
router.delete("/:id", deleteTable);

module.exports = router;