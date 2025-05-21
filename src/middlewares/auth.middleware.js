const jwt = require("jsonwebtoken");
const ApiResponse = require("../utils/apiResponse");
const User = require("../models/user.model");

exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json(ApiResponse.error("Không tìm thấy token xác thực", 401));
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    const user = await User.getById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json(ApiResponse.error("Người dùng không tồn tại", 401));
    }

    // Thêm thông tin user vào request để sử dụng ở các middleware/controller tiếp theo
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json(ApiResponse.error("Token không hợp lệ", 401));
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json(ApiResponse.error("Token đã hết hạn", 401));
    }
    next(error);
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    const userRoles = await User.getUserRoles(req.user.id);
    const isAdmin = userRoles.some((role) => role.TenQuyen === "Admin");

    if (!isAdmin) {
      return res
        .status(403)
        .json(ApiResponse.error("Không có quyền truy cập", 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    const user = await User.getById(decoded.id);
    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Bỏ qua lỗi token và tiếp tục như người dùng chưa đăng nhập
    next();
  }
};
