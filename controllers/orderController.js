const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Order = require("../models/orderModel.js");
const Table = require("../models/tableModel.js");
const Menu = require("../models/menuModel")
const Inventory = require("../models/inventoryModel")


//@desc Get all orders
//@route GET /api/orders
//@access private
const getOrders = asyncHandler( async (req, res) => {
  const orders = await Order.find({ user_id: req.user.id})
  res.status(200).json(orders);
});

// Utility to resolve ingredient names to ObjectIds
const resolveMenuItemsByName = async (menuItemsArray) => {
  const resolved = [];

  for (const item of menuItemsArray) {
    const menuItemDoc = await Menu.findOne({
      name: item.name,
    });
    if (!menuItemDoc) {
      throw new Error(`Menu Items "${item.name}" not found.`);
    }

    resolved.push({
      name: menuItemDoc._id,
      price: menuItemDoc.price,
      ingredients: menuItemDoc.ingredients,
      stock: menuItemDoc.stock,
      quantity: item.quantity,
    });
  }

  return resolved;
};

//@desc Create New orders
//@route POST /api/orders
//@access private
const createOrder = asyncHandler( async (req, res) => {

  console.log("The request body is", req.body);
  const session = await mongoose.startSession();
  session.startTransaction();
  try{
    const { customerName, tableNumber, items } = req.body;
    if (
      !customerName ||
      !tableNumber ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      res.status(400);
      throw new Error("All fields are mandatory !");
    }
    const table = await Table.findOne({ tableNumber });

    if (!table) {
      res.status(404);
      throw new Error(`Table number ${tableNumber} not found.`);
    }

    // 2. Check if table is occupied
    if (table.status === "Occupied") {
      res.status(400);
      throw new Error(`Table number ${tableNumber} is already occupied.`);
    }

    const resolvedMenuItems = await resolveMenuItemsByName(items);

    const inventoryMap = new Map();

    for (const item of resolvedMenuItems) {
      const menuItem = await Menu.findById(item.name)
        .populate("ingredients.ingredient")
        .session(session);
      if (!menuItem) {
        throw new Error(`Menu item not found: ${item.name}`);
      }

      if (
        Array.isArray(menuItem.ingredients) &&
        menuItem.ingredients.length > 0
      ) {
        for (const ing of menuItem.ingredients) {
          if (!ing.ingredient) {
            
            throw new Error(
              `Invalid or missing ingredient in menu item "${menuItem.name}"`
            );
          }
          const totalQty = ing.quantity * item.quantity;
          const ingId = ing.ingredient._id.toString();

          if (inventoryMap.has(ingId)) {
            inventoryMap.set(ingId, inventoryMap.get(ingId) + totalQty);
          } else {
            inventoryMap.set(ingId, totalQty);
          }
        }

        // 2. Check & Deduct Inventory
        for (const [ingredientId, requiredQty] of inventoryMap) {
          const ingredient = await Inventory.findById(ingredientId).session(
            session
          );
          if (!ingredient)
            throw new Error(`Ingredient not found: ${ingredientId}`);
          if (ingredient.quantity < requiredQty) {
            throw new Error(
              `Not enough stock for ingredient: ${ingredient.name}`
            );
          }

          ingredient.quantity -= requiredQty;
          await ingredient.save({ session });
        }
      }

      // 2. Check & Deduct Inventory
      const updatedMenuItem = await Menu.findOneAndUpdate(
        {
          _id: item.name,
          stock: { $gte: item.quantity },
        },
        { $inc: { stock: -item.quantity } },
        { new: true } // returns updated doc
      );
      console.log(updatedMenuItem);

      if (!updatedMenuItem) {
        throw new Error(`Insufficient stock for "${item.name}".`);
      }
    }


    // Calculate total price
    const totalAmount = resolvedMenuItems
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);

    await Table.findByIdAndUpdate(table._id, { status: "Occupied" });

    const order = await Order.create(
      [
        {
          customerName,
          tableNumber,
          items: resolvedMenuItems,
          status: "In Progress",
          totalAmount,
          user_id: req.user.id,
        },
      ],
      { session }
    );
    await session.commitTransaction();
    session.endSession();
    res.status(201).json(order);
  } catch (error) {
  await session.abortTransaction();
  session.endSession();
  res.status(400);
  throw new Error(error.message);
}
});

//@desc Get order
//@route GET /api/orders/:id
//@access private
const getOrder = asyncHandler( async (req, res) => {
  const order = await Order.findById(req.params.id)
  if(!order){
    res.status(404)
    throw new Error("Order not found")
  }
  res.status(200).json(order);
});
//@desc Update order
//@route PATCH /api/orders/:id
//@access private
const updateOrder = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (order.user_id.toString() !== req.user.id) {
      res.status(403);
      throw new Error("User Unauthorized");
    }

    const { items: updatedItems, ...otherUpdates } = req.body;

    if (!updatedItems || !Array.isArray(updatedItems)) {
      res.status(400);
      throw new Error("Updated items must be a valid array");
    }

    // Map of old quantities
    const originalItemMap = new Map();
    for (const item of order.items) {
      originalItemMap.set(item.name.toString(), item.quantity);
    }

    // Resolve updated items with full Menu info
    const resolvedItems = await resolveMenuItemsByName(updatedItems);

    let totalAmount = 0;

    for (const item of resolvedItems) {
      const originalQty = originalItemMap.get(item.name.toString()) || 0;
      const quantityDiff = item.quantity - originalQty;

      const menuItem = await Menu.findById(item.name)
        .populate("ingredients.ingredient")
        .session(session);

      if (!menuItem) {
        throw new Error(`Menu item not found: ${item.name}`);
      }

      // Adjust stock if quantity changed
      if (quantityDiff !== 0) {
        const newStock = menuItem.stock - quantityDiff;
        if (newStock < 0) {
          throw new Error(`Insufficient stock for "${menuItem.name}"`);
        }
        menuItem.stock = newStock;
        await menuItem.save({ session });

        // Adjust ingredients
        for (const ing of menuItem.ingredients) {
          const ingId = ing.ingredient._id;
          const totalIngDiff = ing.quantity * quantityDiff;

          const ingredient = await Inventory.findById(ingId).session(session);
          if (!ingredient) {
            throw new Error(`Ingredient not found: ${ingId}`);
          }

          const newInventoryQty = ingredient.quantity - totalIngDiff;
          if (newInventoryQty < 0) {
            throw new Error(`Not enough ${ingredient.name} in inventory`);
          }

          ingredient.quantity = newInventoryQty;
          await ingredient.save({ session });
        }
      }

      totalAmount += item.price * item.quantity;
    }

    // Save updated order
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        ...otherUpdates,
        items: resolvedItems,
        totalAmount: totalAmount.toFixed(2),
      },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();
    res.status(200).json(updatedOrder);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Update Order Error:", err);
    res.status(500).json({ message: err.message });
  }
});


//@desc Update order status
//@route PUT /api/orders/:id/status
//@access private
const updateOrderStatus = asyncHandler ( async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if(order.user_id.toString() !== req.user.id){
    res.status(403);
    throw new Error("User Unauthorized");
  }

  const updatedOrderStatus = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  res.status(200).json(updatedOrderStatus);
});

//@desc Delete order
//@route DELETE /api/orders/:id
//@access private
const deleteOrder = asyncHandler( async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not Found");
  }
  if (order.user_id.toString() !== req.user.id) {
    res.status(403);
    throw new Error("User Unauthorized");
  }
  // Mark table as Available again
  await Table.findOneAndUpdate(
    { tableNumber: order.tableNumber },
    { status: "Available" }
  );

  await Order.deleteOne({ _id: req.params.id });
  res.status(200).json(order, { message: "Order deleted" });
});

module.exports = {
  getOrders, 
  createOrder, 
  getOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
};