const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const ApiResponse = require("../utils/apiResponse");
const { AppError } = require("../middlewares/error.middleware");

exports.getCart = async (req, res) => {
  try {
    let cart;
    if (req.user) {
      // Nếu đã đăng nhập, lấy giỏ hàng từ database
      cart = await Cart.loadFromDatabase(req.user.id);
    } else {
      // Nếu chưa đăng nhập, lấy từ session
      cart = new Cart(req.session.cart);
    }

    res.json(
      ApiResponse.success("", {
        items: cart.generateArray(),
        totalQty: cart.totalQty,
        totalPrice: cart.totalPrice,
      })
    );
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { id_SanPham_BienThe, SoLuong = 1 } = req.body;

    let cart;
    if (req.user) {
      // Nếu đã đăng nhập, lấy giỏ hàng từ database
      cart = await Cart.loadFromDatabase(req.user.id);
    } else {
      // Nếu chưa đăng nhập, lấy từ session
      cart = new Cart(req.session.cart);
    }

    // Thêm sản phẩm vào giỏ
    await cart.addVariant(id_SanPham_BienThe, SoLuong);

    // Lưu giỏ hàng
    if (req.user) {
      await cart.save(req.user.id);
    } else {
      req.session.cart = cart;
    }

    res.json(
      ApiResponse.success("Thêm vào giỏ hàng thành công", {
        totalQty: cart.totalQty,
        totalPrice: cart.totalPrice,
      })
    );
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { quantity } = req.body;

    let cart;
    if (req.user) {
      cart = await Cart.loadFromDatabase(req.user.id);
    } else {
      cart = new Cart(req.session.cart);
    }

    cart.updateQuantity(variantId, quantity);

    if (req.user) {
      await cart.save(req.user.id);
    } else {
      req.session.cart = cart;
    }

    res.json(
      ApiResponse.success("Cập nhật số lượng thành công", {
        totalQty: cart.totalQty,
        totalPrice: cart.totalPrice,
      })
    );
  } catch (error) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

exports.reduceByOne = async (req, res) => {
  try {
    const { variantId } = req.params;

    let cart;
    if (req.user) {
      cart = await Cart.loadFromDatabase(req.user.id);
    } else {
      cart = new Cart(req.session.cart);
    }

    cart.reduceByOne(variantId);

    if (req.user) {
      await cart.save(req.user.id);
    } else {
      req.session.cart = cart;
    }

    res.json(
      ApiResponse.success("Giảm số lượng thành công", {
        totalQty: cart.totalQty,
        totalPrice: cart.totalPrice,
      })
    );
  } catch (error) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

exports.removeItem = async (req, res) => {
  try {
    const { variantId } = req.params;

    let cart;
    if (req.user) {
      cart = await Cart.loadFromDatabase(req.user.id);
    } else {
      cart = new Cart(req.session.cart);
    }

    cart.removeItem(variantId);

    if (req.user) {
      await cart.save(req.user.id);
    } else {
      req.session.cart = cart;
    }

    res.json(
      ApiResponse.success("Xóa sản phẩm thành công", {
        totalQty: cart.totalQty,
        totalPrice: cart.totalPrice,
      })
    );
  } catch (error) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

exports.clearCart = async (req, res) => {
  try {
    if (req.user) {
      const cart = new Cart();
      await cart.save(req.user.id);
    }

    req.session.cart = null;

    res.json(ApiResponse.success("Xóa giỏ hàng thành công"));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.mergeGuestCart = async (req, res) => {
  try {
    // Kiểm tra nếu có giỏ hàng trong session
    if (!req.session.cart) {
      return res.json(ApiResponse.success("Không có giỏ hàng cần đồng bộ"));
    }

    const guestCart = new Cart(req.session.cart);
    const userCart = await Cart.loadFromDatabase(req.user.id);

    // Thêm từng sản phẩm từ giỏ hàng khách vào giỏ hàng user
    for (const [variantId, item] of Object.entries(guestCart.items)) {
      const product = await Product.getById(item.item.id);
      await userCart.add(product, variantId, item.qty);
    }

    // Lưu giỏ hàng đã merge vào database
    await userCart.save(req.user.id);

    // Xóa giỏ hàng trong session
    req.session.cart = null;

    res.json(
      ApiResponse.success("Đồng bộ giỏ hàng thành công", {
        totalQty: userCart.totalQty,
        totalPrice: userCart.totalPrice,
      })
    );
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};
