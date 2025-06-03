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

router.use(validateToken);
router.route("/").get(getReservations).post(createReservation);

router
  .route("/:id")
  .get(getReservation)
  .put(updateReservation)
  .delete(deleteReservation);


module.exports = router;
