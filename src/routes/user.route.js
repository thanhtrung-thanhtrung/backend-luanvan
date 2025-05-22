const express = require("express");
const router = express.Router();
const multer = require("multer");
const userController = require("../controllers/user.controller");
const { authenticate, isAdmin } = require("../middlewares/auth.middleware");
const { validate, schemas } = require("../utils/validation");

// Cấu hình multer cho upload avatar
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
router.post(
  "/register",
  validate(schemas.user.register),
  userController.register
);
router.post("/login", validate(schemas.user.login), userController.login);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.post(
  "/verify-email",
  validate(schemas.user.verifyEmail),
  userController.verifyEmail
);
router.post(
  "/resend-verification",
  validate(schemas.user.resendVerification),
  userController.resendVerification
);

// Protected routes
router.get("/me", authenticate, userController.getCurrentUser);
router.put(
  "/profile",
  authenticate,
  upload.single("avatar"),
  validate(schemas.user.update),
  userController.updateProfile
);
router.post(
  "/change-password",
  authenticate,
  validate(schemas.user.changePassword),
  userController.changePassword
);

// Admin routes
router.get("/", authenticate, isAdmin, userController.getAllUsers);
router.get("/:id", authenticate, isAdmin, userController.getUserById);
router.delete("/:id", authenticate, isAdmin, userController.deleteUser);

module.exports = router;
