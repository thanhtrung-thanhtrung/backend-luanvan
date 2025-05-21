const Wishlist = require("../models/wishlist.model");
const ApiResponse = require("../utils/apiResponse");
const { AppError } = require("../middlewares/error.middleware");

exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    // Kiểm tra sản phẩm đã có trong wishlist chưa
    const exists = await Wishlist.exists(userId, productId);
    if (exists) {
      throw new AppError("Sản phẩm đã có trong danh sách yêu thích", 400);
    }

    const wishlist = new Wishlist({
      id_NguoiDung: userId,
      id_SanPham: productId,
    });

    await wishlist.save();

    res
      .status(201)
      .json(ApiResponse.success("Thêm vào danh sách yêu thích thành công"));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const success = await Wishlist.delete(userId, productId);
    if (!success) {
      throw new AppError("Sản phẩm không có trong danh sách yêu thích", 404);
    }

    res.json(ApiResponse.success("Xóa khỏi danh sách yêu thích thành công"));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await Wishlist.getByUser(req.user.id, page, limit);

    res.json(ApiResponse.pagination(result.items, page, limit, result.total));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.checkWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const exists = await Wishlist.exists(req.user.id, productId);

    res.json(ApiResponse.success("", { exists }));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.getPopularProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await Wishlist.getPopularProducts(limit);

    res.json(ApiResponse.success("", products));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};
