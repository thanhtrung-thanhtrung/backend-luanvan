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
    variant: Joi.object({
      id_MauSac: Joi.number().required().messages({
        "number.base": "ID màu sắc phải là số",
        "any.required": "ID màu sắc là bắt buộc",
      }),
      id_KichCo: Joi.number().required().messages({
        "number.base": "ID kích cỡ phải là số",
        "any.required": "ID kích cỡ là bắt buộc",
      }),
      SoLuong: Joi.number().integer().min(0).required().messages({
        "number.base": "Số lượng phải là số",
        "number.integer": "Số lượng phải là số nguyên",
        "number.min": "Số lượng không được âm",
        "any.required": "Số lượng là bắt buộc",
      }),
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
    verifyEmail: Joi.object({
      token: Joi.string().required(),
    }),
    resendVerification: Joi.object({
      email: Joi.string().email().required(),
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

  shipping: {
    create: Joi.object({
      Ten: Joi.string().required(),
      MoTa: Joi.string(),
      PhiVanChuyen: Joi.number().min(0).required(),
      TrangThai: Joi.number().valid(0, 1),
    }),
    update: Joi.object({
      Ten: Joi.string(),
      MoTa: Joi.string(),
      PhiVanChuyen: Joi.number().min(0),
      TrangThai: Joi.number().valid(0, 1),
    }),
    calculate: Joi.object({
      diaChiGiao: Joi.string().required(),
      tongTrongLuong: Joi.number().min(0),
      tongGiaTri: Joi.number().min(0),
      products: Joi.array().items(
        Joi.object({
          id: Joi.number().required(),
          quantity: Joi.number().integer().min(1).required(),
        })
      ),
    }),
  },

  payment: {
    create: Joi.object({
      Ten: Joi.string().required(),
      MoTa: Joi.string(),
      TrangThai: Joi.number().valid(0, 1),
    }),
    update: Joi.object({
      Ten: Joi.string(),
      MoTa: Joi.string(),
      TrangThai: Joi.number().valid(0, 1),
    }),
    validate: Joi.object({
      amount: Joi.number().min(0).required(),
    }),
  },

  color: {
    create: Joi.object({
      Ten: Joi.string().required().messages({
        "string.empty": "Tên màu sắc không được để trống",
        "any.required": "Tên màu sắc là bắt buộc",
      }),
      MaMau: Joi.string()
        .required()
        .pattern(/^#[0-9A-Fa-f]{6}$/)
        .messages({
          "string.pattern.base": "Mã màu phải ở định dạng hex (vd: #FF0000)",
          "string.empty": "Mã màu không được để trống",
          "any.required": "Mã màu là bắt buộc",
        }),
    }),
    update: Joi.object({
      Ten: Joi.string().messages({
        "string.empty": "Tên màu sắc không được để trống",
      }),
      MaMau: Joi.string()
        .pattern(/^#[0-9A-Fa-f]{6}$/)
        .messages({
          "string.pattern.base": "Mã màu phải ở định dạng hex (vd: #FF0000)",
          "string.empty": "Mã màu không được để trống",
        }),
    }),
  },

  size: {
    create: Joi.object({
      Ten: Joi.string().required().messages({
        "string.empty": "Tên kích cỡ không được để trống",
        "any.required": "Tên kích cỡ là bắt buộc",
      }),
    }),
    update: Joi.object({
      Ten: Joi.string().messages({
        "string.empty": "Tên kích cỡ không được để trống",
      }),
    }),
  },

  inventory: {
    createEntry: Joi.object({
      supplierId: Joi.number().required().messages({
        "number.base": "ID nhà cung cấp phải là số",
        "any.required": "ID nhà cung cấp là bắt buộc",
      }),
      items: Joi.array()
        .items(
          Joi.object({
            id_SanPham_BienThe: Joi.number().required(),
            SoLuong: Joi.number().min(1).required(),
            DonGia: Joi.number().min(0).required(),
          })
        )
        .min(1)
        .required()
        .messages({
          "array.min": "Phải có ít nhất một sản phẩm",
          "any.required": "Danh sách sản phẩm là bắt buộc",
        }),
      note: Joi.string().allow("", null),
    }),

    createCheck: Joi.object({
      GhiChu: Joi.string().allow("", null),
      details: Joi.array().items(
        Joi.object({
          id_SanPham_BienThe: Joi.number().required(),
          SoLuongHeThong: Joi.number().min(0).required(),
          SoLuongThucTe: Joi.number().min(0).required(),
          ChenhLech: Joi.number().required(),
          GhiChu: Joi.string().allow("", null),
        })
      ),
    }),

    updateCheckStatus: Joi.object({
      status: Joi.number().valid(1, 2, 3).required().messages({
        "number.base": "Trạng thái phải là số",
        "any.required": "Trạng thái là bắt buộc",
        "any.only": "Trạng thái không hợp lệ",
      }),
    }),

    addCheckDetails: Joi.object({
      details: Joi.array()
        .items(
          Joi.object({
            id_SanPham_BienThe: Joi.number().required(),
            SoLuongHeThong: Joi.number().min(0).required(),
            SoLuongThucTe: Joi.number().min(0).required(),
            ChenhLech: Joi.number().required(),
            GhiChu: Joi.string().allow("", null),
          })
        )
        .min(1)
        .required()
        .messages({
          "array.min": "Phải có ít nhất một sản phẩm",
          "any.required": "Danh sách sản phẩm là bắt buộc",
        }),
    }),
  },

  revenue: {
    dateRange: Joi.object({
      startDate: Joi.date().optional().messages({
        "date.base": "Ngày bắt đầu không hợp lệ",
      }),
      endDate: Joi.date().optional().min(Joi.ref("startDate")).messages({
        "date.base": "Ngày kết thúc không hợp lệ",
        "date.min": "Ngày kết thúc phải sau ngày bắt đầu",
      }),
    }),

    productPerformance: Joi.object({
      startDate: Joi.date().optional(),
      endDate: Joi.date().optional().min(Joi.ref("startDate")),
      categoryId: Joi.number().optional(),
      sortBy: Joi.string()
        .valid("DoanhThu", "SoLuongBan", "DiemDanhGia")
        .optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
    }),

    customerAnalytics: Joi.object({
      startDate: Joi.date().optional(),
      endDate: Joi.date().optional().min(Joi.ref("startDate")),
      limit: Joi.number().integer().min(1).max(100).optional(),
    }),

    trendAnalysis: Joi.object({
      period: Joi.string().valid("day", "week", "month").optional(),
    }),
  },

  brand: {
    create: Joi.object({
      Ten: Joi.string().required().messages({
        "string.empty": "Tên thương hiệu không được để trống",
        "any.required": "Tên thương hiệu là bắt buộc",
      }),
      MoTa: Joi.string().allow("", null),
      Website: Joi.string().uri().allow("", null).messages({
        "string.uri": "Website phải là một URL hợp lệ",
      }),
      ThuTu: Joi.number().integer().min(0).default(0),
      SEO_URL: Joi.string()
        .pattern(/^[a-z0-9-]+$/)
        .allow("", null)
        .messages({
          "string.pattern.base":
            "URL SEO chỉ được chứa chữ thường, số và dấu gạch ngang",
        }),
      SEO_TuKhoa: Joi.string().allow("", null),
      SEO_MoTa: Joi.string().allow("", null),
      SEO_TieuDe: Joi.string().allow("", null),
    }),

    update: Joi.object({
      Ten: Joi.string().messages({
        "string.empty": "Tên thương hiệu không được để trống",
      }),
      MoTa: Joi.string().allow("", null),
      Website: Joi.string().uri().allow("", null).messages({
        "string.uri": "Website phải là một URL hợp lệ",
      }),
      ThuTu: Joi.number().integer().min(0),
      TrangThai: Joi.number().valid(0, 1),
      SEO_URL: Joi.string()
        .pattern(/^[a-z0-9-]+$/)
        .allow("", null)
        .messages({
          "string.pattern.base":
            "URL SEO chỉ được chứa chữ thường, số và dấu gạch ngang",
        }),
      SEO_TuKhoa: Joi.string().allow("", null),
      SEO_MoTa: Joi.string().allow("", null),
      SEO_TieuDe: Joi.string().allow("", null),
    }),

    updateOrder: Joi.object({
      brands: Joi.array()
        .items(
          Joi.object({
            id: Joi.number().required(),
            ThuTu: Joi.number().required(),
          })
        )
        .min(1)
        .required()
        .messages({
          "array.min": "Phải có ít nhất một thương hiệu",
          "any.required": "Danh sách thương hiệu là bắt buộc",
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
