const asyncHandler = require("express-async-handler");
const Menu = require("../models/menuModel")
const Inventory = require("../models/inventoryModel")



//@desc Get menu items
//@route GET /api/menu
//@access private
const getMenu = asyncHandler( async (req, res) => {
  const menu = await Menu.find({ user_id: req.user.id})
  res.status(200).json(menu);
});

// Utility to resolve ingredient names to ObjectIds
const resolveIngredientsByName = async (ingredientArray) => {
  const resolved = [];

  for (const item of ingredientArray) {
    const ingredientDoc = await Inventory.findOne({
      itemName: item.ingredient,
    });
    if (!ingredientDoc) {
      throw new Error(`Ingredient "${item.ingredient}" not found.`);
    }

    resolved.push({
      ingredient: ingredientDoc._id,
      quantity: item.quantity,
    });
  }

  return resolved;
};

//@desc Create menu item
//@route POST /api/menu
//@access private
const createMenuItem = asyncHandler( async (req, res) => {
  try {
    console.log("The request body is", req.body);
    const { name, description, price, category, subcategory, ingredients } =
      req.body;
    if (
      !name ||
      !price ||
      !category ||
      !subcategory ||
      !ingredients||
      !Array.isArray(ingredients)
    ) {
      res.status(400);
      throw new Error("All fields are mandatory !");
    }

    const resolvedIngredients = await resolveIngredientsByName(ingredients);

  
    const maxMenuItemsAllowed = 10;
    const existingMenuItemsCount = await Menu.countDocuments();

    if (existingMenuItemsCount >= maxMenuItemsAllowed) {
      res.status(400);
      throw new Error(
        `Maximum menu items limit of ${maxMenuItemsAllowed} reached.`
      );
    }


    const menu = await Menu.create({
      name,
      description,
      price,
      category,
      subcategory,
      ingredients: resolvedIngredients,
      user_id: req.user.id,
    });
    res.status(201).json(menu);
  } catch (error) {
    console.error("Error creating menu item:", error.message);
    res.status(500).json({ message: error.message });
  }
});


//@desc Get menu item
//@route GET /api/menu/:id
//@access private
const getMenuItem = asyncHandler( async (req, res) => {
  const menu = await Menu.findById(req.params.id)
  if(!menu){
    res.status(404)
    throw new Error("Menu item not found")
  }
  res.status(200).json(menu);
});


// @desc    Get all menu items (with optional filters)
// @route   GET /api/menu/filters
// @access  Private
const getAllMenuItems = asyncHandler(async (req, res) => {
 const { category, available, minPrice, maxPrice } = req.query;

 const filter = {};

 if (category) {
   filter.category = category;
 }

 if (available !== undefined) {
   filter.available = available === 'true';
 }

 if (minPrice !== undefined || maxPrice !== undefined) {
   filter.price = {};
   if (minPrice !== undefined) {
     filter.price.$gte = parseFloat(minPrice);
   }
   if (maxPrice !== undefined) {
     filter.price.$lte = parseFloat(maxPrice);
   }
 }

 const items = await Menu.find(filter);

 if (items.length === 0) {
   res.status(404);
   throw new Error("No menu items found matching the criteria");
 }
 res.status(200).json(items);
});


//@desc Update menu item
//@route PUT /api/menu/:id
//@access private
const updateMenuItem = asyncHandler ( async (req, res) => {
  const menu = await Menu.findById(req.params.id);
  if (!menu) {
    res.status(404);
    throw new Error("Menu Item not found");
  }

  if(menu.user_id.toString() !== req.user.id){
    res.status(403);
    throw new Error("User Unauthorized");
  }

  const updatedMenuItem = await Menu.findByIdAndUpdate(
    req.params.id,
    req.body,
    {new: true}
);
  res.status(200).json(updatedMenuItem);
});


//@desc Delete menu item
//@route DELETE /api/menu/:id
//@access private
const deleteMenuItem = asyncHandler( async (req, res) => {
  const menu = await Menu.findById(req.params.id);
    if(!menu){
      res.status(404);
      throw new Error("menu item not Found")
    }
    if (menu.user_id.toString() !== req.user.id) {
      res.status(403);
      throw new Error("User Unauthorized");
    }
  await Menu.deleteOne({_id: req.params.id});
  res.status(200).json(menu)
});

module.exports = {
  getMenu, 
  createMenuItem, 
  getMenuItem,
  getAllMenuItems,
  updateMenuItem,
  deleteMenuItem,
};