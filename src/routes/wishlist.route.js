const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlist.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { validate, schemas } = require("../utils/validation");

router.get("/", authenticate, wishlistController.getWishlist);

router.post(
  "/",
  authenticate,
  validate(schemas.wishlist.add),
  wishlistController.addToWishlist
);

router.delete(
  "/:productId",
  authenticate,
  wishlistController.removeFromWishlist
);

router.get("/check/:productId", authenticate, wishlistController.checkWishlist);

router.get("/popular", wishlistController.getPopularProducts);

module.exports = router;
