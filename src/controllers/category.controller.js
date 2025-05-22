const Category = require("../models/category.model");
const UploadService = require("../services/upload.service");
const ApiResponse = require("../utils/apiResponse");
const { AppError } = require("../middlewares/error.middleware");

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.json(ApiResponse.success("", categories));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.getCategory = async (req, res) => {
  try {
    let category;
    if (req.params.identifier.match(/^\d+$/)) {
      // If identifier is numeric, treat as ID
      category = await Category.getById(req.params.identifier);
    } else {
      // Otherwise treat as slug
      category = await Category.getBySlug(req.params.identifier);
    }

    if (!category) {
      throw new AppError("Không tìm thấy danh mục", 404);
    }

    res.json(ApiResponse.success("", category));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.createCategory = async (req, res) => {
  try {
    const categoryData = req.body;

    // Handle image upload
    if (req.file) {
      const imageResult = await UploadService.uploadBuffer(req.file.buffer);
      categoryData.HinhAnh = imageResult.secure_url;
    }

    // Generate unique slug if not provided
    if (!categoryData.SEO_URL) {
      categoryData.SEO_URL = await Category.generateUniqueSlug(
        categoryData.Ten
      );
    } else {
      // Check if provided slug exists
      const slugExists = await Category.checkSlugExists(categoryData.SEO_URL);
      if (slugExists) {
        throw new AppError("URL SEO đã tồn tại", 400);
      }
    }

    // Set SEO title if not provided
    if (!categoryData.SEO_TieuDe) {
      categoryData.SEO_TieuDe = categoryData.Ten;
    }

    const category = new Category(categoryData);
    const id = await category.save();

    res
      .status(201)
      .json(ApiResponse.success("Tạo danh mục thành công", { id }));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const categoryData = req.body;

    const existingCategory = await Category.getById(categoryId);
    if (!existingCategory) {
      throw new AppError("Không tìm thấy danh mục", 404);
    }

    // Handle image upload
    if (req.file) {
      // Delete old image if exists
      if (existingCategory.HinhAnh) {
        const publicId = UploadService.getPublicIdFromUrl(
          existingCategory.HinhAnh
        );
        await UploadService.deleteImage(publicId);
      }
      const imageResult = await UploadService.uploadBuffer(req.file.buffer);
      categoryData.HinhAnh = imageResult.secure_url;
    }

    // Check and update slug
    if (
      categoryData.SEO_URL &&
      categoryData.SEO_URL !== existingCategory.SEO_URL
    ) {
      const slugExists = await Category.checkSlugExists(
        categoryData.SEO_URL,
        categoryId
      );
      if (slugExists) {
        throw new AppError("URL SEO đã tồn tại", 400);
      }
    }

    const category = new Category({
      id: categoryId,
      ...existingCategory,
      ...categoryData,
    });

    await category.update();

    res.json(ApiResponse.success("Cập nhật danh mục thành công"));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.getById(categoryId);
    if (!category) {
      throw new AppError("Không tìm thấy danh mục", 404);
    }

    // Delete category image if exists
    if (category.HinhAnh) {
      const publicId = UploadService.getPublicIdFromUrl(category.HinhAnh);
      await UploadService.deleteImage(publicId);
    }

    await Category.delete(categoryId);

    res.json(ApiResponse.success("Xóa danh mục thành công"));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.updateCategoryOrder = async (req, res) => {
  try {
    const { categories } = req.body;

    if (!Array.isArray(categories)) {
      throw new AppError("Dữ liệu không hợp lệ", 400);
    }

    // Validate all category IDs exist
    for (const cat of categories) {
      const exists = await Category.getById(cat.id);
      if (!exists) {
        throw new AppError(`Danh mục với ID ${cat.id} không tồn tại`, 404);
      }
    }

    await Category.updateOrder(categories);

    res.json(ApiResponse.success("Cập nhật thứ tự danh mục thành công"));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};
