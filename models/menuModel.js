const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Menu", menuSchema);