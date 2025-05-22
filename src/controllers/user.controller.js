const UserService = require("../services/user.service");
const ApiResponse = require("../utils/apiResponse");
const User = require("../models/user.model");

exports.register = async (req, res) => {
  try {
    const avatar = req.file;
    const userData = {
      ...req.body,
      Avatar: avatar ? avatar.path : null,
    };

    const { user, token } = await UserService.register(userData);

    res
      .status(201)
      .json(
        ApiResponse.success("Đăng ký tài khoản thành công", { user, token })
      );
  } catch (error) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

exports.login = async (req, res) => {
  try {
    const { Email, MatKhau } = req.body;
    const { user, token } = await UserService.login(Email, MatKhau);

    res.json(ApiResponse.success("Đăng nhập thành công", { user, token }));
  } catch (error) {
    res.status(401).json(ApiResponse.error(error.message));
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.getById(req.user.id);
    res.json(ApiResponse.success("", { user }));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const avatar = req.file;
    const updateData = {
      ...req.body,
      Avatar: avatar,
    };

    const updatedUser = await UserService.updateProfile(
      req.user.id,
      updateData
    );
    res.json(
      ApiResponse.success("Cập nhật thông tin thành công", {
        user: updatedUser,
      })
    );
  } catch (error) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { MatKhauCu, MatKhauMoi } = req.body;

    await UserService.changePassword(req.user.id, MatKhauCu, MatKhauMoi);

    res.json(ApiResponse.success("Đổi mật khẩu thành công"));
  } catch (error) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const resetToken = await UserService.initiatePasswordReset(email);

    // Trong thực tế, token sẽ được gửi qua email
    // Ở đây trả về token để test
    res.json(
      ApiResponse.success(
        "Link đặt lại mật khẩu đã được gửi vào email của bạn",
        { resetToken }
      )
    );
  } catch (error) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    await UserService.resetPassword(token, password);

    res.json(ApiResponse.success("Đặt lại mật khẩu thành công"));
  } catch (error) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    await UserService.verifyEmail(token);
    res.json(ApiResponse.success("Xác thực email thành công"));
  } catch (error) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    await UserService.resendVerification(email);
    res.json(
      ApiResponse.success("Link xác thực mới đã được gửi vào email của bạn")
    );
  } catch (error) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};

// Admin functions
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;

    const result = await User.getAll({ page, limit, search });

    res.json(ApiResponse.pagination(result.users, page, limit, result.total));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.getById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json(ApiResponse.error("Không tìm thấy người dùng"));
    }

    res.json(ApiResponse.success("", { user }));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const success = await User.delete(req.params.id);
    if (!success) {
      return res
        .status(404)
        .json(ApiResponse.error("Không tìm thấy người dùng"));
    }

    res.json(ApiResponse.success("Xóa người dùng thành công"));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};
