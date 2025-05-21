const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplier.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validate } = require("../utils/validation");

// Get all suppliers
router.get(
  "/",
  authenticate,
  authorize(["Admin"]),
  supplierController.getAllSuppliers
);

// Get a supplier by ID
router.get(
  "/:id",
  authenticate,
  authorize(["Admin"]),
  supplierController.getSupplierById
);

// Create a new supplier
router.post(
  "/",
  authenticate,
  authorize(["Admin"]),
  supplierController.createSupplier
);

// Update a supplier
router.put(
  "/:id",
  authenticate,
  authorize(["Admin"]),
  supplierController.updateSupplier
);

// Delete a supplier
router.delete(
  "/:id",
  authenticate,
  authorize(["Admin"]),
  supplierController.deleteSupplier
);

module.exports = router;
