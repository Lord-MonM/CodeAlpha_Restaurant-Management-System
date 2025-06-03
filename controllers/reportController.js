const asyncHandler = require("express-async-handler");
const Table = require("../models/tableModel.js")
const Inventory = require("../models/inventoryModel.js")
const Menu = require("../models/menuModel.js")
const Order = require("../models/orderModel.js")

//@desc Get sales report 
//@route GET /api/reports/sales
//@access private
const getSalesReport = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    const sales = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json(sales);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});


//@desc get inventory reports
//@route GET /api/reports/inventory-usage
//@access private
const getInventoryUsage = asyncHandler(async (req, res) => {
  const inventory = await Inventory.find({ user_id: req.user.id})
  const { startDate, endDate } = req.query;

  const usage = await Inventory.aggregate([
    {
      $match: {
        updatedAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: "$itemName",
        totalUsed: { $sum: "$quantity" },
        unit: { $first: "$unit" },
      },
    },
  ]);

  res.status(200).json(usage);
});

//@desc get popular dishes
//@route GET /api/reports/popular-dishes
//@access private
const getPopularDishes = asyncHandler(async (req, res) => {
  const order = await Order.find({ user_id: req.user.id})
  const popular = await Order.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.name",
        totalOrdered: { $sum: "$items.quantity" },
      },
    },
    {
      $addFields: {
        itemObjectId: { $toObjectId: "$_id" }, // convert string to ObjectId
      },
    },
    {
      $lookup: {
        from: "menus",
        localField: "itemObjectId",
        foreignField: "_id",
        as: "menuItem",
      },
    },
    { $unwind: "$menuItem" },
    {
      $project: {
        _id: 0,
        itemName: "$menuItem.name",
        totalOrdered: 1,
      },
    },
    { $sort: { totalOrdered: -1 } },
    { $limit: 10 },
  ]);

  res.status(200).json(popular);
});

//@desc Get tables in use
//@route GET /api/reports/tables
//@access private
const tablesUsage = asyncHandler(async (req, res) => {
  const { status } = req.query;

  if (!status) {
    res.status(400);
    throw new Error("Status query parameter is required");
  }

  const tables = await Table.aggregate([
    {
      $match: { status }
    },
    { $project: { _id: 0, tableNumber: 1 } }
  ]);

  res.status(200).json(tables);
});



module.exports = {
  getSalesReport,
  getInventoryUsage,
  getPopularDishes,
  tablesUsage,
};