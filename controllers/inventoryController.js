const asyncHandler = require("express-async-handler");
const Inventory = require("../models/inventoryModel")

//@desc Get all inventories
//@route GET /api/inventory
//@access private
const getInventories = asyncHandler( async (req, res) => {
  const inventory = await Inventory.find({ user_id: req.user.id });
  res.status(200).json(inventory);
});

//@desc Create New inventories
//@route POST /api/inventory
//@access private
const createInventory = asyncHandler( async (req, res) => {
  try {
    console.log("The request body is", req.body);
    const { itemName, quantity, unit, threshold } = req.body;
    if (!itemName || !quantity || !unit) {
      res.status(400);
      throw new Error("All fields are mandatory !");
    }


    const existingItems = await Inventory.findOne({ itemName });
    if (existingItems) {
      res.status(409); // Conflict
      throw new Error(`${itemName} is already in stock.`);
    }

    const inventory = await Inventory.create({
      itemName,
      quantity,
      unit,
      user_id: req.user.id,
    });
    res.status(201).json(inventory);
  } catch (error) {
    console.error("Error creating inventory:", error.message);
    res.status(500).json({ message: error.message });
  }
});

//@desc Get inventory
//@route GET /api/inventory/:id
//@access private
const getInventory = asyncHandler( async (req, res) => {
  const inventory = await Inventory.findById(req.params.id)
  if(!inventory){
    res.status(404)
    throw new Error("Item not found")
  }
  res.status(200).json(inventory);
});

// @desc Get low stock inventory items
// @route GET /api/inventory/low-stock
// @access private
const getLowStockItems = asyncHandler(async (req, res) => {
  try{
  const lowStockItems = await Inventory.aggregate([
    {
      $match: {
        $expr: { $lt: ["$quantity", "$threshold"] }// Only return items for the logged-in user
      }
    }
  ]);

  res.status(200).json(lowStockItems);
  }catch(err){
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

//@desc Update inventory
//@route PUT /api/inventory/:id
//@access private
const updateInventory = asyncHandler ( async (req, res) => {
  const inventory = await Inventory.findById(req.params.id);
  if (!inventory) {
    res.status(404);
    throw new Error("Item not found");
  }


  const updatedInventory= await Inventory.findByIdAndUpdate(
    req.params.id,
    req.body,
    {new: true}
);
  res.status(200).json(updatedInventory);
});


//@desc Delete inventory
//@route DELETE /api/inventory/:id
//@access private
const deleteInventory = asyncHandler( async (req, res) => {
  const inventory = await Inventory.findById(req.params.id);
    if(!inventory){
      res.status(404);
      throw new Error("item not Found")
    }
    // if table.user_id.toString() !== req.user.id) {
    //   //res.status(403);
    //   throw new Error("User don't have permission to update other user table");
    // }
  await Inventory.deleteOne({_id: req.params.id});
  res.status(200).json(inventory)
});

module.exports = {
  getInventories, 
  createInventory, 
  getInventory,
  updateInventory,
  getLowStockItems,
  deleteInventory,
};