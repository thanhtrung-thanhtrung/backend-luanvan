const express = require("express");
const router = express.Router();
const revenueController = require("../controllers/revenue.controller");
const { authenticate, isAdmin } = require("../middlewares/auth.middleware");
const { validate, schemas } = require("../utils/validation");

// All routes require authentication and admin privileges
router.use(authenticate);
router.use(isAdmin);

// Revenue analytics routes
router.get(
  "/stats",
  validate(schemas.revenue.dateRange),
  revenueController.getRevenueStats
);
router.get(
  "/products",
  validate(schemas.revenue.productPerformance),
  revenueController.getProductPerformance
);
router.get(
  "/categories",
  validate(schemas.revenue.dateRange),
  revenueController.getCategoryPerformance
);
router.get(
  "/customers",
  validate(schemas.revenue.customerAnalytics),
  revenueController.getCustomerAnalytics
);
router.get(
  "/trends",
  validate(schemas.revenue.trendAnalysis),
  revenueController.getTrendAnalysis
);

module.exports = router;
