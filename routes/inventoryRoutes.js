const express = require("express");
const router = express.Router();
const {
  getInventories,
  createInventory,
  getInventory,
  getLowStockItems,
  updateInventory,
  deleteInventory,
} = require("../controllers/inventoryController.js");
const validateToken = require("../middleware/validateTokenHandler.js");
const authorizeRoles = require("../middleware/roleMiddleware.js");

router.use(validateToken);
router.use(authorizeRoles("admin", "manager"));
router.route("/").get(getInventories).post(createInventory);

router.route("/low-stock").get(getLowStockItems);

router.route("/:id").get(getInventory).put(updateInventory).delete(deleteInventory);




module.exports = router;
