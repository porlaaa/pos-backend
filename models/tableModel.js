const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  _id: {
    type: Number,
  },

  tableNo: {
    type: Number,
    required: true,
    unique: true,
  },

  seats: {
    type: Number,
    default: 4,
  },


  status: {
    type: String,
    default: "Available",
  },

  currentOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    default: null,
  },
});

module.exports = mongoose.model("Table", tableSchema);