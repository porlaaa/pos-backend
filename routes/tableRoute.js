const express = require("express");

const router = express.Router();

const {
  addTable,
  getTables,
  updateTable,
  deleteTable,
} = require("../controllers/tableController");
const { isVerifiedUser, requireRole } = require("../middlewares/tokenVerification");

const adminOnly = requireRole("Admin");

router.post("/", isVerifiedUser, adminOnly, addTable);
router.get("/", isVerifiedUser, getTables);
router.put("/:id", isVerifiedUser, updateTable);
router.delete("/:id", isVerifiedUser, adminOnly, deleteTable);

module.exports = router;