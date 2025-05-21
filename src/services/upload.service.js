const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");
const { AppError } = require("../middlewares/error.middleware");

class UploadService {
  static async uploadBuffer(buffer, folder = "products") {
    return new Promise((resolve, reject) => {
      const writeStream = cloudinary.uploader.upload_stream(
        {
          folder: `shoes_shop/${folder}`,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) return reject(new AppError("Lỗi upload ảnh", 500));
          resolve(result);
        }
      );

      const readStream = Readable.from(buffer);
      readStream.pipe(writeStream);
    });
  }

  static async uploadMultiple(files, folder = "products") {
    const uploadPromises = files.map((file) =>
      this.uploadBuffer(file.buffer, folder)
    );
    return Promise.all(uploadPromises);
  }

  static async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
      throw new AppError("Lỗi xóa ảnh", 500);
    }
  }

  static async deleteMultiple(publicIds) {
    try {
      const result = await cloudinary.api.delete_resources(publicIds);
      return result;
    } catch (error) {
      console.error("Error deleting images from Cloudinary:", error);
      throw new AppError("Lỗi xóa nhiều ảnh", 500);
    }
  }

  static getPublicIdFromUrl(url) {
    try {
      const splitUrl = url.split("/");
      const filename = splitUrl[splitUrl.length - 1];
      // Remove file extension
      const publicId = filename.split(".")[0];
      return `shoes_shop/${splitUrl[splitUrl.length - 2]}/${publicId}`;
    } catch (error) {
      console.error("Error extracting public ID:", error);
      throw new AppError("Lỗi xử lý ảnh", 500);
    }
  }

  static async optimizeImage(publicId, options = {}) {
    const defaultOptions = {
      quality: "auto",
      fetch_format: "auto",
      crop: "scale",
    };

    const transformationOptions = { ...defaultOptions, ...options };

    try {
      const result = await cloudinary.uploader.explicit(publicId, {
        type: "upload",
        transformation: [transformationOptions],
      });
      return result;
    } catch (error) {
      console.error("Error optimizing image:", error);
      throw new AppError("Lỗi tối ưu ảnh", 500);
    }
  }

  static generateImageUrl(publicId, options = {}) {
    return cloudinary.url(publicId, {
      secure: true,
      ...options,
    });
  }
}

module.exports = UploadService;
