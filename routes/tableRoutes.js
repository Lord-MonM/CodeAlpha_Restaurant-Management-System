const express = require("express");
const router = express.Router();
const {
  getTable,
  createTable,
  getTables,
  updateTable,
  updateTableStatus,
  deleteTable,
} = require("../controllers/tableController.js");
const validateToken = require("../middleware/validateTokenHandler.js");
const authorizeRoles = require("../middleware/roleMiddleware.js")

router.use(validateToken);
router.use(authorizeRoles("admin", "manager"));
router.route("/").get(getTables).post(createTable);

router.route("/:id").get(getTable).put(updateTable).delete(deleteTable);
router.route("/:id/status").patch(updateTableStatus)

module.exports = router;
