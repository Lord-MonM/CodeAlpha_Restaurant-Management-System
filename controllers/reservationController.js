const asyncHandler = require("express-async-handler");
const moment = require("moment")
const Reservation = require("../models/reservationModel.js")
const Table = require("../models/tableModel.js")

//@desc Get all reservations
//@route GET /api/reservation
//@access private
const getReservations = asyncHandler( async (req, res) => {
  const reservations = await Reservation.find({ user_id: req.user.id})
  res.status(200).json(reservations);
});

//@desc Create reservation
//@route POST /api/reservation
//@access private
const createReservation = asyncHandler( async (req, res) => {
  try {
    console.log("The request body is", req.body);
    const { customerName, guests, tableNumber, date, time } = req.body;
    if (!customerName || !guests || !tableNumber || !date || !time) {
      res.status(400);
      throw new Error("All fields are mandatory !");
    }

    if (!moment(date, "YYYY-MM-DD", true).isValid()) {
      res.status(400);
      throw new Error("Date must be in YYYY-MM-DD format.");
    }

    if (!moment(time, "HH:mm", true).isValid()) {
      res.status(400);
      throw new Error("Time must be in HH:mm (24-hour) format.");
    }

    const table = await Table.findOne({tableNumber });

    if (!table) {
      res.status(404);
      throw new Error(`Table number ${tableNumber} not found.`);
    }

    if (table.status === "Occupied") {
      res.status(409); // Conflict
      throw new Error(`Table number ${tableNumber} is already in use.`);
    }

    if (guests > table.seats) {
      res.status(409);
      throw new Error(`Table has only ${table.seats} seats.`);
    }

    await Table.findByIdAndUpdate(table._id, { status: "Occupied" });
  

    const reservation = await Reservation.create({
      customerName,
      guests,
      tableNumber,
      date,
      time,
      user_id: req.user.id,
    });
    res.status(201).json(reservation);
  } catch (error) {
    console.error("Error creating reservation:", error.message);
    res.status(500).json({ message: error.message });
  }
});

//@desc Get reservation
//@route GET /api/reservation/:id
//@access private
const getReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    res.status(404);
    throw new Error("Reservation not found");
  }
  res.status(200).json(reservation);
});

//@desc Update reservation
//@route PUT /api/reservation/:id
//@access private
const updateReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    res.status(404);
    throw new Error("Reservation not found");
  }

  if (reservation.user_id.toString() !== req.user.id) {
    res.status(403);
    throw new Error("User Unauthorized");
  }

  const updatedReservation = await Reservation.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );
  res.status(200).json(updatedReservation);
});


//@desc Delete reservation
//@route DELETE /api/reservation/:id
//@access private
const deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    res.status(404);
    throw new Error("Reservation not Found");
  }
  if (reservation.user_id.toString() !== req.user.id) {
    res.status(403);
    throw new Error("User Unauthorized");
  }

  try{
    await Reservation.deleteOne({ _id: req.params.id });
    res.json({ message: "Reservation canceled" });
  }catch(err){
   res.status(400).json({ error: err.message });
  }  
  res.status(200).json(reservation);
});

module.exports = {
  getReservations, 
  createReservation, 
  getReservation,
  updateReservation,
  deleteReservation,
};