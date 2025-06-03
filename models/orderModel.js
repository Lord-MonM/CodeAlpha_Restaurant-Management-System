const mongoose = require("mongoose")

const orderSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    customerName:{
      type: String,
      required: [true, "Please enter your name"]
    },
    tableNumber: {
      type: Number,
      required: [true, "Please enter the table number"],
    },
    items: [{ name: String, quantity: Number }],
    totalAmount: Number,
    status: {
      type: String,
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);