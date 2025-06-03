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

router.use(validateToken)
router.route("/")
  .get(getOrders)
  .post(createOrder);

router.route("/:id")
  .get(getOrder)
  .patch(updateOrder)
  .delete(deleteOrder);

router.route("/:id/status").put(updateOrderStatus);  

module.exports = router;