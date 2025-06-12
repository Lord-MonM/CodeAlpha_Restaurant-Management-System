const express = require("express");
const router = express.Router();
const {
  getReservations,
  createReservation,
  getReservation,
  updateReservation,
  deleteReservation,
} = require("../controllers/reservationController.js");
const validateToken = require("../middleware/validateTokenHandler.js");
const authorizeRoles = require("../middleware/roleMiddleware.js");

router.use(validateToken);
router
  .route("/")
  .get(authorizeRoles("admin", "manager"), getReservations)
  .post(authorizeRoles("admin", "manager", "user"), createReservation);

router
  .route("/:id")
  .get(authorizeRoles("admin", "manager", "user"), getReservation)
  .put(authorizeRoles("admin", "manager", "user"), updateReservation)
  .delete(authorizeRoles("admin", "manager", "user"), deleteReservation);


module.exports = router;
