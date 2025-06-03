const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  customerName: {
    type: String,
    required: true,
  },
  guests: {
    type: Number,
    required: true,
  },
  tableNumber: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Reservation", reservationSchema);
