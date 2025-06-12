const express = require("express");
const router = express.Router();
const {
  getMenu,
  createMenuItem,
  getMenuItem,
  getAllMenuItems,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuController.js");
const validateToken = require("../middleware/validateTokenHandler.js");
const authorizeRoles = require("../middleware/roleMiddleware.js");

router.use(validateToken);
router
  .route("/")
  .get(authorizeRoles("admin", "manager", "user"), getMenu)
  .post(authorizeRoles("admin", "manager"), createMenuItem);

router
  .route("/filters")
  .get(authorizeRoles("admin", "manager", "user"), getAllMenuItems);

router
  .route("/:id")
  .put(authorizeRoles("admin", "manager"), updateMenuItem)
  .get(authorizeRoles("admin", "manager", "user"), getMenuItem)
  .delete(authorizeRoles("admin", "manager"), deleteMenuItem);

module.exports = router;
