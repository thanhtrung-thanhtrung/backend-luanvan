const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventory.controller");
const { authenticate, isAdmin } = require("../middlewares/auth.middleware");
const { validate, schemas } = require("../utils/validation");

// All routes require authentication
router.use(authenticate);
router.use(isAdmin);

// Stock entries and history
router.get("/history", inventoryController.getStockHistory);
router.get("/alerts", inventoryController.getStockAlerts);
router.get("/stats", inventoryController.getInventoryStats);
router.get("/low-stock", inventoryController.getLowStockProducts);

// Stock entries
router.post(
  "/entries",
  validate(schemas.inventory.createEntry),
  inventoryController.createStockEntry
);
router.get("/entries", inventoryController.getStockEntries);
router.get("/entries/:id", inventoryController.getStockEntryDetails);

// Inventory checks
router.post(
  "/checks",
  validate(schemas.inventory.createCheck),
  inventoryController.createInventoryCheck
);
router.get("/checks", inventoryController.getAllInventoryChecks);
router.get("/checks/:id", inventoryController.getInventoryCheck);
router.patch(
  "/checks/:id/status",
  validate(schemas.inventory.updateCheckStatus),
  inventoryController.updateInventoryCheckStatus
);
router.post(
  "/checks/:id/details",
  validate(schemas.inventory.addCheckDetails),
  inventoryController.addInventoryCheckDetail
);

module.exports = router;
