const Joi = require("joi");

const schemas = {
  product: {
    create: Joi.object({
      Ten: Joi.string().required(),
      MoTa: Joi.string().required(),
      MoTaChiTiet: Joi.string(),
      ThongSoKyThuat: Joi.object(),
      Gia: Joi.number().min(0).required(),
      GiaKhuyenMai: Joi.number().min(0),
      id_DanhMuc: Joi.number().required(),
      id_ThuongHieu: Joi.number().required(),
      id_NhaCungCap: Joi.number().required(),
      variants: Joi.array().items(
        Joi.object({
          id_KichCo: Joi.number().required(),
          id_MauSac: Joi.number().required(),
          SoLuong: Joi.number().min(0).required(),
        })
      ),
    }),
    update: Joi.object({
      Ten: Joi.string(),
      MoTa: Joi.string(),
      MoTaChiTiet: Joi.string(),
      ThongSoKyThuat: Joi.object(),
      Gia: Joi.number().min(0),
      GiaKhuyenMai: Joi.number().min(0),
      id_DanhMuc: Joi.number(),
      id_ThuongHieu: Joi.number(),
      id_NhaCungCap: Joi.number(),
      TrangThai: Joi.number().valid(0, 1),
      variants: Joi.array().items(
        Joi.object({
          id: Joi.number(),
          id_KichCo: Joi.number(),
          id_MauSac: Joi.number(),
          SoLuong: Joi.number().min(0),
        })
      ),
    }),
  },

  order: {
    create: Joi.object({
      TenNguoiNhan: Joi.string().required(),
      SDTNguoiNhan: Joi.string()
        .pattern(/^[0-9]{10,11}$/)
        .required(),
      EmailNguoiNhan: Joi.string().email(),
      DiaChiNhan: Joi.string().required(),
      GhiChu: Joi.string(),
      id_HinhThucThanhToan: Joi.number().required(),
      id_HinhThucVanChuyen: Joi.number().required(),
      MaGiamGia: Joi.string(),
    }),
  },

  review: {
    create: Joi.object({
      productId: Joi.number().required(),
      orderId: Joi.number().required(),
      rating: Joi.number().min(1).max(5).required(),
      content: Joi.string().required(),
      images: Joi.array().items(Joi.string()),
    }),
  },

  user: {
    register: Joi.object({
      HoTen: Joi.string().required(),
      Email: Joi.string().email().required(),
      MatKhau: Joi.string().min(6).required(),
      SDT: Joi.string().pattern(/^[0-9]{10,11}$/),
      DiaChi: Joi.string(),
    }),
    login: Joi.object({
      Email: Joi.string().email().required(),
      MatKhau: Joi.string().required(),
    }),
    update: Joi.object({
      HoTen: Joi.string(),
      SDT: Joi.string().pattern(/^[0-9]{10,11}$/),
      DiaChi: Joi.string(),
    }),
    changePassword: Joi.object({
      MatKhauCu: Joi.string().required(),
      MatKhauMoi: Joi.string().min(6).required(),
    }),
  },

  wishlist: {
    add: Joi.object({
      productId: Joi.number().required().messages({
        "number.base": "ID sản phẩm phải là số",
        "any.required": "ID sản phẩm là bắt buộc",
      }),
    }),
  },
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");

      return res.status(400).json({
        status: "error",
        message: "Dữ liệu không hợp lệ",
        errors: errorMessage,
      });
    }

    next();
  };
};

module.exports = {
  schemas,
  validate,
};
