const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const {
  authenticate,
  isAdmin,
  optionalAuth,
} = require("../middlewares/auth.middleware");
const { validate, schemas } = require("../utils/validation");

// Public routes - có thể đặt hàng không cần đăng nhập
router.post(
  "/",
  optionalAuth,
  validate(schemas.order.create),
  orderController.createOrder
);

// Protected routes - yêu cầu đăng nhập
router.get("/me", authenticate, orderController.getUserOrders);

router.get("/me/:id", authenticate, orderController.getOrder);

router.post(
  "/me/:id/cancel",
  authenticate,
  validate(schemas.order.cancel),
  orderController.updateOrderStatus
);

// Admin routes - yêu cầu quyền admin
router.get("/", authenticate, isAdmin, orderController.getAllOrders);

router.get(
  "/statistics",
  authenticate,
  isAdmin,
  orderController.getOrderStatistics
);

router.get("/:id", authenticate, isAdmin, orderController.getOrder);

router.patch(
  "/:id/status",
  authenticate,
  isAdmin,
  validate(schemas.order.updateStatus),
  orderController.updateOrderStatus
);

module.exports = router;
