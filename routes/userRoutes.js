const express = require("express");
const validateToken = require("../middleware/validateTokenHandler.js");
const authorizeRoles = require("../middleware/roleMiddleware.js")

const router = express.Router();

//Only admin can access this router

router.get("/admin ", authorizeRoles("admin"), validateToken, (req,res) =>{
 res.json({message: "Welcome admin"})
});

//Both admin and manager can access this router

router.get("/manager",validateToken, authorizeRoles("admin", "manager"), (req, res) => {
  res.json({ message: "Welcome admin" });
});

// All can access this router

router.get(
  "/user",
  validateToken,
  authorizeRoles("admin", "manager", "user"),
  (req, res) => {
    res.json({ message: "Welcome admin" });
  }
);

module.exports = router;