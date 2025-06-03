const mongoose = require("mongoose");

const tableSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    tableNumber: { 
      type: Number, 
      required: [true, "Please add the seat number"], 
      unique: true },
    seats: { 
      type: Number, 
      required: [true, "Please add the number of seats"]
    },
    status: {
      type: String,
      enum: ["Available", "Occupied"],
      default: "Available",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Table", tableSchema);