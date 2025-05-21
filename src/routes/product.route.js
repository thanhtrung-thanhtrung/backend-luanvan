const express = require("express");
const router = express.Router();
const multer = require("multer");
const productController = require("../controllers/product.controller");
const { authenticate, isAdmin } = require("../middlewares/auth.middleware");

// Cấu hình multer để xử lý upload file
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
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
router.get("/", productController.getAllProducts);
router.get("/search", productController.searchProducts);
router.get("/:id", productController.getProductById);
router.get("/:id/variants", productController.getProductVariants);

// Admin routes with image upload
router.post(
  "/",
  authenticate,
  isAdmin,
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 5 },
  ]),
  productController.createProduct
);

router.put(
  "/:id",
  authenticate,
  isAdmin,
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 5 },
  ]),
  productController.updateProduct
);

router.delete("/:id", authenticate, isAdmin, productController.deleteProduct);

module.exports = router;
