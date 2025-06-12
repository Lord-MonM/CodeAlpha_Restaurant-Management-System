const express = require("express")
const router = express.Router();
const {
  getOrders,
  createOrder,
  getOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder
} = require("../controllers/orderController.js");
const validateToken = require("../middleware/validateTokenHandler.js");
const authorizeRoles = require("../middleware/roleMiddleware.js");

router.use(validateToken)
router
  .route("/")
  .get(authorizeRoles("admin", "manager"), getOrders)
  .post(authorizeRoles("admin", "manager","user"), createOrder);

router
  .route("/:id")
  .get(authorizeRoles("admin", "manager", "user"), getOrder)
  .patch(authorizeRoles("admin", "manager", "user"), updateOrder)
  .delete(authorizeRoles("admin", "manager", "user"), deleteOrder);

router
  .route("/:id/status")
  .put(authorizeRoles("admin", "manager"), updateOrderStatus);  

module.exports = router;