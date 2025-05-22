const Brand = require("../models/brand.model");
const UploadService = require("../services/upload.service");
const ApiResponse = require("../utils/apiResponse");
const { AppError } = require("../middlewares/error.middleware");

exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.getAll();
    res.json(ApiResponse.success("", brands));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.getBrand = async (req, res) => {
  try {
    let brand;
    if (req.params.identifier.match(/^\d+$/)) {
      // If identifier is numeric, treat as ID
      brand = await Brand.getById(req.params.identifier);
    } else {
      // Otherwise treat as slug
      brand = await Brand.getBySlug(req.params.identifier);
    }

    if (!brand) {
      throw new AppError("Không tìm thấy thương hiệu", 404);
    }

    // Get brand statistics
    const stats = await Brand.getStats(brand.id);
    brand.ThongKe = stats;

    res.json(ApiResponse.success("", brand));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.createBrand = async (req, res) => {
  try {
    const brandData = req.body;

    // Handle logo upload
    if (req.file) {
      const imageResult = await UploadService.uploadBuffer(req.file.buffer);
      brandData.Logo = imageResult.secure_url;
    }

    // Generate unique slug if not provided
    if (!brandData.SEO_URL) {
      brandData.SEO_URL = await Brand.generateUniqueSlug(brandData.Ten);
    } else {
      // Check if provided slug exists
      const slugExists = await Brand.checkSlugExists(brandData.SEO_URL);
      if (slugExists) {
        throw new AppError("URL SEO đã tồn tại", 400);
      }
    }

    // Set SEO title if not provided
    if (!brandData.SEO_TieuDe) {
      brandData.SEO_TieuDe = brandData.Ten;
    }

    const brand = new Brand(brandData);
    const id = await brand.save();

    res
      .status(201)
      .json(ApiResponse.success("Tạo thương hiệu thành công", { id }));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const brandId = req.params.id;
    const brandData = req.body;

    const existingBrand = await Brand.getById(brandId);
    if (!existingBrand) {
      throw new AppError("Không tìm thấy thương hiệu", 404);
    }

    // Handle logo upload
    if (req.file) {
      // Delete old logo if exists
      if (existingBrand.Logo) {
        const publicId = UploadService.getPublicIdFromUrl(existingBrand.Logo);
        await UploadService.deleteImage(publicId);
      }
      const imageResult = await UploadService.uploadBuffer(req.file.buffer);
      brandData.Logo = imageResult.secure_url;
    }

    // Check and update slug
    if (brandData.SEO_URL && brandData.SEO_URL !== existingBrand.SEO_URL) {
      const slugExists = await Brand.checkSlugExists(
        brandData.SEO_URL,
        brandId
      );
      if (slugExists) {
        throw new AppError("URL SEO đã tồn tại", 400);
      }
    }

    const brand = new Brand({
      id: brandId,
      ...existingBrand,
      ...brandData,
    });

    await brand.update();

    res.json(ApiResponse.success("Cập nhật thương hiệu thành công"));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const brandId = req.params.id;

    const brand = await Brand.getById(brandId);
    if (!brand) {
      throw new AppError("Không tìm thấy thương hiệu", 404);
    }

    // Delete brand logo if exists
    if (brand.Logo) {
      const publicId = UploadService.getPublicIdFromUrl(brand.Logo);
      await UploadService.deleteImage(publicId);
    }

    await Brand.delete(brandId);

    res.json(ApiResponse.success("Xóa thương hiệu thành công"));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.updateBrandOrder = async (req, res) => {
  try {
    const { brands } = req.body;

    if (!Array.isArray(brands)) {
      throw new AppError("Dữ liệu không hợp lệ", 400);
    }

    // Validate all brand IDs exist
    for (const brand of brands) {
      const exists = await Brand.getById(brand.id);
      if (!exists) {
        throw new AppError(`Thương hiệu với ID ${brand.id} không tồn tại`, 404);
      }
    }

    await Brand.updateOrder(brands);

    res.json(ApiResponse.success("Cập nhật thứ tự thương hiệu thành công"));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};
