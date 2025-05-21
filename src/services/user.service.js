const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user.model");
const UploadService = require("./upload.service");

class UserService {
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(user) {
    return jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );
  }

  static generateResetToken() {
    return {
      token: crypto.randomBytes(32).toString("hex"),
      expires: new Date(Date.now() + 3600000), // 1 hour
    };
  }

  static async register(userData) {
    const existingUser = await User.getByEmail(userData.Email);
    if (existingUser) {
      throw new Error("Email đã được sử dụng");
    }

    // Handle avatar path
    if (userData.Avatar) {
      userData.Avatar = userData.Avatar.replace(/\\/g, "/");
    }

    // Hash password
    userData.MatKhau = await this.hashPassword(userData.MatKhau);

    // Create user
    const userId = await User.create(userData);

    // Add default customer role (id = 3)
    await User.addUserRole(userId, 3);

    // Get user with roles
    const user = await User.getById(userId);
    const roles = await User.getUserRoles(userId);

    // Generate token
    const token = this.generateToken(user);

    return {
      user: {
        ...user,
        roles,
      },
      token,
    };
  }

  static async login(Email, MatKhau) {
    // Kiểm tra email tồn tại
    const user = await User.getByEmail(Email);
    if (!user) {
      throw new Error("Email hoặc mật khẩu không chính xác");
    }

    // Kiểm tra trạng thái tài khoản
    if (user.TrangThai !== 1) {
      throw new Error("Tài khoản đã bị khóa hoặc chưa kích hoạt");
    }

    // Kiểm tra mật khẩu
    const isValidPassword = await this.comparePassword(MatKhau, user.MatKhau);
    if (!isValidPassword) {
      throw new Error("Email hoặc mật khẩu không chính xác");
    }

    // Lấy quyền của người dùng
    const roles = await User.getUserRoles(user.id);

    // Tạo token và trả về thông tin
    const token = this.generateToken(user);

    // Loại bỏ thông tin nhạy cảm
    const {
      MatKhau: hashedPass,
      salt,
      reset_token,
      reset_token_expiry,
      ...userInfo
    } = user;

    return {
      user: {
        ...userInfo,
        roles,
      },
      token,
    };
  }

  static async updateProfile(userId, updateData) {
    // Upload new avatar if provided
    if (updateData.Avatar?.buffer) {
      const user = await User.getById(userId);
      if (user.Avatar) {
        // Delete old avatar
        const publicId = UploadService.getPublicIdFromUrl(user.Avatar);
        await UploadService.deleteImage(publicId);
      }

      const result = await UploadService.uploadBuffer(
        updateData.Avatar.buffer,
        "avatars"
      );
      updateData.Avatar = result.secure_url;
    }

    await User.update(userId, updateData);
    return User.getById(userId);
  }

  static async changePassword(userId, oldPassword, newPassword) {
    const user = await User.getById(userId);

    const isValidPassword = await this.comparePassword(
      oldPassword,
      user.MatKhau
    );
    if (!isValidPassword) {
      throw new Error("Mật khẩu hiện tại không chính xác");
    }

    const hashedPassword = await this.hashPassword(newPassword);
    await User.update(userId, { MatKhau: hashedPassword });
  }

  static async initiatePasswordReset(email) {
    const user = await User.getByEmail(email);
    if (!user) {
      throw new Error("Email không tồn tại trong hệ thống");
    }

    const { token, expires } = this.generateResetToken();
    await User.update(user.id, {
      reset_token: token,
      reset_token_expiry: expires,
    });

    // Tại đây sẽ thêm logic gửi email reset password
    return token;
  }

  static async resetPassword(token, newPassword) {
    const user = await User.getByResetToken(token);
    if (!user) {
      throw new Error("Token không hợp lệ hoặc đã hết hạn");
    }

    if (new Date() > new Date(user.reset_token_expiry)) {
      throw new Error("Token đã hết hạn");
    }

    const hashedPassword = await this.hashPassword(newPassword);
    await User.update(user.id, {
      MatKhau: hashedPassword,
      reset_token: null,
      reset_token_expiry: null,
    });
  }
}

module.exports = UserService;
