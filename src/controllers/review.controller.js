const Review = require("../models/review.model");
const UploadService = require("../services/upload.service");
const ApiResponse = require("../utils/apiResponse");
const { AppError } = require("../middlewares/error.middleware");

exports.createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, content } = req.body;
    const userId = req.user.id;

    // Kiểm tra xem người dùng đã mua sản phẩm chưa
    const hasOrdered = await Review.checkOrderProduct(
      userId,
      productId,
      orderId
    );
    if (!hasOrdered) {
      throw new AppError("Bạn chỉ có thể đánh giá sản phẩm đã mua", 400);
    }

    // Kiểm tra xem đã đánh giá chưa
    const hasReviewed = await Review.checkExistingReview(
      userId,
      productId,
      orderId
    );
    if (hasReviewed) {
      throw new AppError("Bạn đã đánh giá sản phẩm này", 400);
    }

    // Upload ảnh nếu có
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadResults = await UploadService.uploadMultiple(
        req.files,
        "reviews"
      );
      imageUrls = uploadResults.map((result) => result.secure_url);
    }

    const review = new Review({
      id_SanPham: productId,
      id_NguoiDung: userId,
      id_DonHang: orderId,
      SoSao: rating,
      NoiDung: content,
      HinhAnh: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
    });

    await review.save();

    res.status(201).json(ApiResponse.success("Đánh giá sản phẩm thành công"));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await Review.getByProduct(productId, page, limit);

    // Parse stored JSON image arrays
    result.reviews = result.reviews.map((review) => ({
      ...review,
      HinhAnh: review.HinhAnh ? JSON.parse(review.HinhAnh) : [],
    }));

    res.json(ApiResponse.pagination(result.reviews, page, limit, result.total));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.getProductReviewStats = async (req, res) => {
  try {
    const { productId } = req.params;
    const stats = await Review.getProductRating(productId);

    res.json(ApiResponse.success("", stats));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await Review.getByUser(userId, page, limit);

    // Parse stored JSON image arrays
    result.reviews = result.reviews.map((review) => ({
      ...review,
      HinhAnh: review.HinhAnh ? JSON.parse(review.HinhAnh) : [],
    }));

    res.json(ApiResponse.pagination(result.reviews, page, limit, result.total));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.getById(req.params.id);

    if (!review) {
      throw new AppError("Không tìm thấy đánh giá", 404);
    }

    // Kiểm tra quyền xóa
    if (!req.user.isAdmin && review.id_NguoiDung !== req.user.id) {
      throw new AppError("Không có quyền xóa đánh giá này", 403);
    }

    // Xóa ảnh từ Cloudinary nếu có
    if (review.HinhAnh) {
      const images = JSON.parse(review.HinhAnh);
      if (images.length > 0) {
        const publicIds = images.map((url) =>
          UploadService.getPublicIdFromUrl(url)
        );
        await UploadService.deleteMultiple(publicIds);
      }
    }

    await Review.delete(req.params.id);

    res.json(ApiResponse.success("Xóa đánh giá thành công"));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};
