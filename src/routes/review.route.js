const express = require("express");
const router = express.Router();
const multer = require("multer");
const reviewController = require("../controllers/review.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { validate, schemas } = require("../utils/validation");

// Cấu hình multer cho upload ảnh đánh giá
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5, // Tối đa 5 ảnh cho mỗi đánh giá
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
router.get("/product/:productId", reviewController.getProductReviews);
router.get("/stats/product/:productId", reviewController.getProductReviewStats);

// Protected routes - yêu cầu đăng nhập
router.post(
  "/",
  authenticate,
  upload.array("images", 5),
  validate(schemas.review.create),
  reviewController.createReview
);

router.get("/user/me", authenticate, reviewController.getUserReviews);

// Admin routes
router.delete("/:id", authenticate, reviewController.deleteReview);

module.exports = router;
