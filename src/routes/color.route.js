const express = require("express");
const router = express.Router();
const colorController = require("../controllers/color.controller");
const { authenticate, isAdmin } = require("../middlewares/auth.middleware");
const { validate, schemas } = require("../utils/validation");

// Public routes
router.get("/", colorController.getAllColors);
router.get("/:id", colorController.getColor);

// Admin routes
router.post(
  "/",
  authenticate,
  isAdmin,
  validate(schemas.color.create),
  colorController.createColor
);
router.put(
  "/:id",
  authenticate,
  isAdmin,
  validate(schemas.color.update),
  colorController.updateColor
);
router.delete("/:id", authenticate, isAdmin, colorController.deleteColor);

module.exports = router;
