const express = require("express");
const router = express.Router();
const {
  getSalesReport,
  getInventoryUsage,
  getPopularDishes,
  tablesUsage,
} = require("../controllers/reportController.js");
const validateToken = require("../middleware/validateTokenHandler.js");
const authorizeRoles = require("../middleware/roleMiddleware.js");

router.use(validateToken);
router.use(authorizeRoles("manager"));
router.route("/");
router.get("/sales", getSalesReport);
router.get("/inventory-usage", getInventoryUsage);
router.get("/popular-dishes", getPopularDishes);
router.get("/tables-stats", tablesUsage);

module.exports = router;
