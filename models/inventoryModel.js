const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    itemName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      enum: ["kg", "g", "litre", "ml", "pcs"],
    }, // e.g., kg, liters, pcs
    threshold: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inventory", inventorySchema);
