const express = require("express");
const router = express.Router();
const multer = require("multer");
const paymentController = require("../controllers/payment.controller");
const { authenticate, isAdmin } = require("../middlewares/auth.middleware");
const { validate, schemas } = require("../utils/validation");

// Cấu hình multer cho upload icon/logo phương thức thanh toán
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file hình ảnh"));
    }
  },
});

// Public routes
router.get("/", paymentController.getAllPaymentMethods);
router.get("/:id", paymentController.getPaymentMethod);
router.post(
  "/:methodId/validate",
  validate(schemas.payment.validate),
  paymentController.validatePayment
);

// Admin routes
router.post(
  "/",
  authenticate,
  isAdmin,
  upload.single("icon"),
  validate(schemas.payment.create),
  paymentController.createPaymentMethod
);

router.put(
  "/:id",
  authenticate,
  isAdmin,
  upload.single("icon"),
  validate(schemas.payment.update),
  paymentController.updatePaymentMethod
);

router.delete(
  "/:id",
  authenticate,
  isAdmin,
  paymentController.deletePaymentMethod
);

module.exports = router;
