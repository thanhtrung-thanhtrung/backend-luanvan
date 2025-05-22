const express = require("express");
const router = express.Router();
const multer = require("multer");
const productController = require("../controllers/product.controller");
const { authenticate, isAdmin } = require("../middlewares/auth.middleware");
const { validate, schemas } = require("../utils/validation");

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
router.get("/:id/colors", productController.getAvailableColors);
router.get("/:id/sizes", productController.getAvailableSizes);

// Admin routes with image upload
router.post(
  "/",
  authenticate,
  isAdmin,
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 5 },
  ]),
  validate(schemas.product.create),
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
  validate(schemas.product.update),
  productController.updateProduct
);

router.delete("/:id", authenticate, isAdmin, productController.deleteProduct);

// Product variant management routes
router.post(
  "/:id/variants",
  authenticate,
  isAdmin,
  validate(schemas.product.variant),
  productController.addProductVariant
);

router.put(
  "/:id/variants/:variantId",
  authenticate,
  isAdmin,
  validate(schemas.product.variant),
  productController.updateProductVariant
);

router.delete(
  "/:id/variants/:variantId",
  authenticate,
  isAdmin,
  productController.deleteProductVariant
);

module.exports = router;
