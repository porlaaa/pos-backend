const express = require("express");

const router = express.Router();

const {
  addOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  addItemToOrder,
  getOrderByTableId,
  updatePaymentMethod,
} = require("../controllers/orderController");

const {
  isVerifiedUser,
} = require("../middlewares/tokenVerification");

// =====================================================
// ORDER
// =====================================================

// ✅ CREATE ORDER
router.post(
  "/",
  isVerifiedUser,
  addOrder
);

// ✅ GET ALL ORDERS
router.get(
  "/",
  isVerifiedUser,
  getOrders
);

// ✅ IMPORTANT:
// ต้องมาก่อน /:id
router.get(
  "/table/:tableId",
  isVerifiedUser,
  getOrderByTableId
);

// ✅ GET ORDER BY ID
router.get(
  "/:id",
  isVerifiedUser,
  getOrderById
);

// ✅ UPDATE ORDER STATUS
router.put(
  "/:id",
  isVerifiedUser,
  updateOrderStatus
);

// ✅ ADD ITEM TO EXISTING ORDER
router.put(
  "/:id/add-item",
  isVerifiedUser,
  addItemToOrder
);

// ✅ UPDATE PAYMENT METHOD
router.patch(
  "/:id/payment",
  isVerifiedUser,
  updatePaymentMethod
);

module.exports = router;