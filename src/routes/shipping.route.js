const express = require("express");
const router = express.Router();
const shippingController = require("../controllers/shipping.controller");
const { authenticate, isAdmin } = require("../middlewares/auth.middleware");
const { validate, schemas } = require("../utils/validation");

// Public routes
router.get("/", shippingController.getAllShippingMethods);
router.get("/:id", shippingController.getShippingMethod);
router.post(
  "/:methodId/calculate",
  validate(schemas.shipping.calculate),
  shippingController.calculateShippingFee
);

// Admin routes
router.post(
  "/",
  authenticate,
  isAdmin,
  validate(schemas.shipping.create),
  shippingController.createShippingMethod
);
router.put(
  "/:id",
  authenticate,
  isAdmin,
  validate(schemas.shipping.update),
  shippingController.updateShippingMethod
);
router.delete(
  "/:id",
  authenticate,
  isAdmin,
  shippingController.deleteShippingMethod
);

module.exports = router;
