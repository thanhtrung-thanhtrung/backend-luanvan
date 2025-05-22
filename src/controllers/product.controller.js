const Product = require("../models/product.model");
const UploadService = require("../services/upload.service");
const ApiResponse = require("../utils/apiResponse");

exports.getAllProducts = async (req, res) => {
  try {
    const filters = {
      categoryId: req.query.categoryId,
      brandId: req.query.brandId,
      priceMin:
        req.query.priceMin !== undefined
          ? parseFloat(req.query.priceMin)
          : undefined,
      priceMax:
        req.query.priceMax !== undefined
          ? parseFloat(req.query.priceMax)
          : undefined,
      colors: req.query.colors ? req.query.colors.split(",") : undefined,
      sizes: req.query.sizes ? req.query.sizes.split(",") : undefined,
      inStock: req.query.inStock === "true",
      search: req.query.search,
      sort: req.query.sort,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 12,
    };

    const products = await Product.getAll(filters);

    // Get total count for pagination
    const totalProducts = await Product.getCount(filters);
    const totalPages = Math.ceil(totalProducts / filters.limit);

    res.json(
      ApiResponse.success("", {
        products,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: totalProducts,
          totalPages,
        },
      })
    );
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json(ApiResponse.error("Sản phẩm không tồn tại"));
    }

    const variants = await Product.getVariants(req.params.id);
    const relatedProducts = await Product.getRelatedProducts(req.params.id);

    res.json(
      ApiResponse.success("", {
        product: {
          ...product,
          variants,
        },
        relatedProducts,
      })
    );
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const products = await Product.search(req.query.keyword);
    res.json({
      status: "success",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getProductVariants = async (req, res) => {
  try {
    const productId = req.params.id;
    const variants = await Product.getVariants(productId);

    if (!variants.length) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy biến thể cho sản phẩm này",
      });
    }

    res.json(ApiResponse.success("", variants));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.addProductVariant = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.getById(productId);

    if (!product) {
      throw new AppError("Không tìm thấy sản phẩm", 404);
    }

    const productInstance = new Product(product);
    const variantId = await productInstance.addVariant(req.body);

    res
      .status(201)
      .json(
        ApiResponse.success("Thêm biến thể sản phẩm thành công", {
          id: variantId,
        })
      );
  } catch (error) {
    const statusCode = error.message.includes("đã tồn tại") ? 400 : 500;
    res.status(statusCode).json(ApiResponse.error(error.message));
  }
};

exports.updateProductVariant = async (req, res) => {
  try {
    const { id: productId, variantId } = req.params;
    const product = await Product.getById(productId);

    if (!product) {
      throw new AppError("Không tìm thấy sản phẩm", 404);
    }

    const productInstance = new Product(product);
    await productInstance.updateVariant(variantId, req.body);

    res.json(ApiResponse.success("Cập nhật biến thể sản phẩm thành công"));
  } catch (error) {
    const statusCode = error.message.includes("không tồn tại") ? 404 : 500;
    res.status(statusCode).json(ApiResponse.error(error.message));
  }
};

exports.deleteProductVariant = async (req, res) => {
  try {
    const { id: productId, variantId } = req.params;
    const product = await Product.getById(productId);

    if (!product) {
      throw new AppError("Không tìm thấy sản phẩm", 404);
    }

    const productInstance = new Product(product);
    await productInstance.deleteVariant(variantId);

    res.json(ApiResponse.success("Xóa biến thể sản phẩm thành công"));
  } catch (error) {
    const statusCode = error.message.includes("đã được đặt hàng")
      ? 400
      : error.message.includes("không tồn tại")
      ? 404
      : 500;
    res.status(statusCode).json(ApiResponse.error(error.message));
  }
};

exports.getAvailableColors = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { sizeId } = req.query;

    if (!sizeId) {
      throw new AppError("Vui lòng chọn kích cỡ", 400);
    }

    const colors = await Product.getAvailableColors(productId, sizeId);
    res.json(ApiResponse.success("", colors));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.getAvailableSizes = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { colorId } = req.query;

    if (!colorId) {
      throw new AppError("Vui lòng chọn màu sắc", 400);
    }

    const sizes = await Product.getAvailableSizes(productId, colorId);
    res.json(ApiResponse.success("", sizes));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

// Admin functions
exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;

    // Xử lý upload ảnh
    if (req.files) {
      const mainImage = req.files.mainImage?.[0];
      const additionalImages = req.files.additionalImages;

      if (mainImage) {
        const mainImageResult = await UploadService.uploadBuffer(
          mainImage.buffer
        );
        productData.HinhAnh = {
          anhChinh: mainImageResult.secure_url,
          anhPhu: [],
        };
      }

      if (additionalImages && additionalImages.length > 0) {
        const results = await UploadService.uploadMultiple(additionalImages);
        productData.HinhAnh.anhPhu = results.map((result) => result.secure_url);
      }

      productData.HinhAnh = JSON.stringify(productData.HinhAnh);
    }

    const product = new Product(productData);
    const productId = await product.save();

    res.status(201).json({
      status: "success",
      message: "Tạo sản phẩm thành công",
      data: { id: productId },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const productData = req.body;
    const existingProduct = await Product.getById(productId);

    if (!existingProduct) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Xử lý upload ảnh mới
    if (req.files) {
      const mainImage = req.files.mainImage?.[0];
      const additionalImages = req.files.additionalImages;
      const currentImages = JSON.parse(
        existingProduct.HinhAnh || '{"anhChinh": "", "anhPhu": []}'
      );

      // Upload và cập nhật ảnh chính nếu có
      if (mainImage) {
        // Xóa ảnh cũ
        if (currentImages.anhChinh) {
          const publicId = UploadService.getPublicIdFromUrl(
            currentImages.anhChinh
          );
          await UploadService.deleteImage(publicId);
        }

        const mainImageResult = await UploadService.uploadBuffer(
          mainImage.buffer
        );
        currentImages.anhChinh = mainImageResult.secure_url;
      }

      // Upload và cập nhật ảnh phụ nếu có
      if (additionalImages && additionalImages.length > 0) {
        // Xóa ảnh phụ cũ nếu được yêu cầu
        if (req.body.deleteAdditionalImages === "true") {
          const publicIds = currentImages.anhPhu.map((url) =>
            UploadService.getPublicIdFromUrl(url)
          );
          await UploadService.deleteMultiple(publicIds);
          currentImages.anhPhu = [];
        }

        const results = await UploadService.uploadMultiple(additionalImages);
        currentImages.anhPhu = [
          ...currentImages.anhPhu,
          ...results.map((result) => result.secure_url),
        ];
      }

      productData.HinhAnh = JSON.stringify(currentImages);
    }

    const product = new Product({
      id: productId,
      ...productData,
    });

    await product.update();

    res.json({
      status: "success",
      message: "Cập nhật sản phẩm thành công",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.getById(productId);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Xóa ảnh từ Cloudinary
    if (product.HinhAnh) {
      const images = JSON.parse(product.HinhAnh);
      const allImages = [images.anhChinh, ...(images.anhPhu || [])].filter(
        Boolean
      );

      const publicIds = allImages.map((url) =>
        UploadService.getPublicIdFromUrl(url)
      );

      await UploadService.deleteMultiple(publicIds);
    }

    await Product.delete(productId);

    res.json({
      status: "success",
      message: "Xóa sản phẩm thành công",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
