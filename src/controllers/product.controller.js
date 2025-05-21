const Product = require("../models/product.model");
const UploadService = require("../services/upload.service");

exports.getAllProducts = async (req, res) => {
  try {
    const filters = {
      categoryId: req.query.categoryId,
      brandId: req.query.brandId,
      priceMin: req.query.priceMin,
      priceMax: req.query.priceMax,
    };

    const products = await Product.getAll(filters);
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

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Sản phẩm không tồn tại",
      });
    }

    const variants = await Product.getVariants(req.params.id);

    res.json({
      status: "success",
      data: {
        ...product,
        variants,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
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

    res.json({
      status: "success",
      data: variants,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
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
