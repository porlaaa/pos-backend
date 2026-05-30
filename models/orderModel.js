const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerDetails: {
      name: String,
      phone: String,
      guests: Number,
    },

    orderStatus: {
      type: String,
      default: "pending",
    },

    items: [
      {
        name: String,
        price: Number,
        quantity: Number,
        total: Number,

        note: {
          type: String,
          default: "",
        },
      },
    ],

    bills: {
      total: Number,
      tax: Number,
      totalWithTax: Number,
    },

    // ✅ FIX สำคัญ
    table: {
      type: Number,
    },

    paymentMethod: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Order",
  orderSchema
);