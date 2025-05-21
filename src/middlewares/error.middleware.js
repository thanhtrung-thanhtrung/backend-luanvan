const ApiResponse = require("../utils/apiResponse");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  // Lỗi validation từ Joi
  if (err.name === "ValidationError") {
    return res.status(400).json(ApiResponse.error(err.message, 400));
  }

  // Lỗi unique constraint từ MySQL
  if (err.code === "ER_DUP_ENTRY") {
    return res
      .status(400)
      .json(ApiResponse.error("Dữ liệu đã tồn tại trong hệ thống", 400));
  }

  // Lỗi foreign key constraint
  if (err.code === "ER_NO_REFERENCED_ROW") {
    return res
      .status(400)
      .json(ApiResponse.error("Dữ liệu tham chiếu không tồn tại", 400));
  }

  // Lỗi từ multer
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json(ApiResponse.error("File upload quá lớn", 400));
    }
    return res
      .status(400)
      .json(ApiResponse.error(`Lỗi upload file: ${err.message}`, 400));
  }

  // Lỗi từ cloudinary
  if (err.http_code) {
    return res
      .status(err.http_code)
      .json(ApiResponse.error(`Lỗi xử lý ảnh: ${err.message}`, err.http_code));
  }

  // Lỗi từ JWT
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json(ApiResponse.error("Token không hợp lệ", 401));
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json(ApiResponse.error("Token đã hết hạn", 401));
  }

  // Lỗi operational (do chúng ta tạo)
  if (err.isOperational) {
    return res
      .status(err.statusCode)
      .json(ApiResponse.error(err.message, err.statusCode));
  }

  // Lỗi lập trình hoặc lỗi không xác định khác
  console.error("ERROR 💥", err);
  res
    .status(500)
    .json(ApiResponse.error("Có lỗi xảy ra, vui lòng thử lại sau", 500));
};

module.exports = {
  AppError,
  errorHandler,
};
