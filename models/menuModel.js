const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
    },
    category: {
      type: String,
      enum: ["Appetizer", "Main Course", "Pizza", "Dessert", "Beverage"],
      required: true,
    },
    subcategory: {
      type: String,
      enum: ["Alcoholic", "Non-Alcoholic", "Pasta"],
      required: function () {
        return this.category === "Beverage" || "Main Course";
      },
    },
    available: {
      type: Boolean,
      default: true,
    },
    ingredients: {
      type: [
        {
          ingredient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Inventory",
          },
          quantity: { type: Number, required: true }, // amount per one serving
        },
      ],
      default: [],
    },

    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Menu", menuSchema);
