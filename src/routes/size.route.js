const express = require("express");
const router = express.Router();
const sizeController = require("../controllers/size.controller");
const { authenticate, isAdmin } = require("../middlewares/auth.middleware");
const { validate, schemas } = require("../utils/validation");

// Public routes
router.get("/", sizeController.getAllSizes);
router.get("/:id", sizeController.getSize);
router.get("/stats/overview", sizeController.getSizeStats);
router.get("/stats/popular", sizeController.getMostPopularSizes);
router.get(
  "/stats/low-stock",
  authenticate,
  isAdmin,
  sizeController.getLowStockSizes
);

// Admin routes
router.post(
  "/",
  authenticate,
  isAdmin,
  validate(schemas.size.create),
  sizeController.createSize
);
router.put(
  "/:id",
  authenticate,
  isAdmin,
  validate(schemas.size.update),
  sizeController.updateSize
);
router.delete("/:id", authenticate, isAdmin, sizeController.deleteSize);

module.exports = router;
