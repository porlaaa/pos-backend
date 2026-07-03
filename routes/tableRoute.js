const express = require("express");

const router = express.Router();

const {
  addTable,
  getTables,
  updateTable,
  deleteTable,
} = require("../controllers/tableController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");

router.post("/", isVerifiedUser, addTable);
router.get("/", isVerifiedUser, getTables);
router.put("/:id", isVerifiedUser, updateTable);
router.delete("/:id", isVerifiedUser, deleteTable);

module.exports = router;