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

router.use(validateToken);
router.route("/").get(getMenu).post(createMenuItem);

router.route("/filters").get(getAllMenuItems);

router
  .route("/:id")
  .put(updateMenuItem)
  .get(getMenuItem)
  .delete(deleteMenuItem);

module.exports = router;
