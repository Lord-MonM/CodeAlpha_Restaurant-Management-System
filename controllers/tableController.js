const asyncHandler = require("express-async-handler");
const Table = require("../models/tableModel.js")

//@desc Get all tables
//@route GET /api/tables
//@access private
const getTables = asyncHandler( async (req, res) => {
  const tables = await Table.find({ user_id: req.user.id})
  res.status(200).json(tables);
});

//@desc Create New Tables
//@route POST /api/tables
//@access private
const createTable = asyncHandler( async (req, res) => {
  try {
    console.log("The request body is", req.body);
    const { tableNumber, seats, status } = req.body;
    if (!tableNumber || !seats) {
      res.status(400);
      throw new Error("All fields are mandatory !");
    }

    const maxTablesAllowed = 10;
    const existingTablesCount = await Table.countDocuments();

    if (existingTablesCount >= maxTablesAllowed) {
      res.status(400);
      throw new Error(`Maximum table limit of ${maxTablesAllowed} reached.`);
    }

    const existingTable = await Table.findOne({tableNumber });
    if (existingTable) {
      res.status(409); // Conflict
      throw new Error(`Table number ${tableNumber} is already in use.`);
    }

    const table = await Table.create({
      tableNumber,
      seats,
      status,
      user_id: req.user.id,
    });
    res.status(201).json(table);
  } catch (error) {
    console.error("Error creating table:", error.message);
    res.status(500).json({ message: error.message });
  }
});

//@desc Get table
//@route GET /api/table/:id
//@access private
const getTable = asyncHandler( async (req, res) => {
  const table = await Table.findById(req.params.id)
  if(!table){
    res.status(404)
    throw new Error("Table not found")
  }
  res.status(200).json(table);
});

//@desc Update table
//@route PUT /api/table/:id
//@access private
const updateTable = asyncHandler ( async (req, res) => {
  const table = await Table.findById(req.params.id);
  if (!table) {
    res.status(404);
    throw new Error("Table not found");
  }

  if(table.user_id.toString() !== req.user.id){
    res.status(403);
    throw new Error("User Unauthorized");
  }

  const updatedTable = await Table.findByIdAndUpdate(
    req.params.id,
    req.body,
    {new: true}
);
  res.status(200).json(updatedTable);
});

//@desc Update table status
//@route PATCH /api/table/:id/status
//@access private
const updateTableStatus = asyncHandler ( async (req, res) => {
  const table = await Table.findById(req.params.id);
  if (!table) {
    res.status(404);
    throw new Error("Table not found");
  }

  if(table.user_id.toString() !== req.user.id){
    res.status(403);
    throw new Error("User Unauthorized");
  }

  if (!req.body.status) {
    res.status(400);
    throw new Error("Missing 'status' field in request body");
  }

  const updatedTableStatus = await Table.findByIdAndUpdate(
    req.params.id,
    {status: req.body.status},
    {new: true}
);
  res.status(200).json(updatedTableStatus);
});

//@desc Delete table
//@route DELETE /api/table/:id
//@access private
const deleteTable = asyncHandler( async (req, res) => {
  const table = await Table.findById(req.params.id);
    if(!table){
      res.status(404);
      throw new Error("Table not Found")
    }
    if (table.user_id.toString() !== req.user.id) {
      res.status(403);
      throw new Error("User Unauthorized");
    }
  await Table.deleteOne({_id: req.params.id});
  res.status(200).json(table)
});

module.exports = {
  getTables, 
  createTable, 
  getTable,
  updateTable,
  updateTableStatus,
  deleteTable,
};