const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");

// Tất cả route đều là public vì giỏ hàng hoạt động qua session
router.get("/", cartController.getCart);
router.post("/add", cartController.addToCart);
router.delete("/remove/:variantId", cartController.removeItem);
router.put("/reduce/:variantId", cartController.reduceByOne);
router.delete("/clear", cartController.clearCart);

module.exports = router;
