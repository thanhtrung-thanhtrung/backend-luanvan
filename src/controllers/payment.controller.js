const PaymentMethod = require("../models/payment.model");
const UploadService = require("../services/upload.service");
const ApiResponse = require("../utils/apiResponse");
const { AppError } = require("../middlewares/error.middleware");

exports.getAllPaymentMethods = async (req, res) => {
  try {
    const onlyActive = req.query.all !== "true";
    const methods = await PaymentMethod.getAll(onlyActive);
    res.json(ApiResponse.success("", methods));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.getPaymentMethod = async (req, res) => {
  try {
    const method = await PaymentMethod.getById(req.params.id);
    if (!method) {
      throw new AppError("Không tìm thấy phương thức thanh toán", 404);
    }
    res.json(ApiResponse.success("", method));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.createPaymentMethod = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.file) {
      const result = await UploadService.uploadBuffer(
        req.file.buffer,
        "payments"
      );
      data.HinhAnh = result.secure_url;
    }

    const method = new PaymentMethod(data);
    const id = await method.save();

    res
      .status(201)
      .json(
        ApiResponse.success("Tạo phương thức thanh toán thành công", { id })
      );
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.updatePaymentMethod = async (req, res) => {
  try {
    const exists = await PaymentMethod.getById(req.params.id);
    if (!exists) {
      throw new AppError("Không tìm thấy phương thức thanh toán", 404);
    }

    const data = { ...req.body };

    if (req.file) {
      // Delete old image if exists
      if (exists.HinhAnh) {
        const publicId = UploadService.getPublicIdFromUrl(exists.HinhAnh);
        await UploadService.deleteImage(publicId);
      }

      // Upload new image
      const result = await UploadService.uploadBuffer(
        req.file.buffer,
        "payments"
      );
      data.HinhAnh = result.secure_url;
    }

    await PaymentMethod.update(req.params.id, data);
    res.json(ApiResponse.success("Cập nhật phương thức thanh toán thành công"));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.deletePaymentMethod = async (req, res) => {
  try {
    const exists = await PaymentMethod.getById(req.params.id);
    if (!exists) {
      throw new AppError("Không tìm thấy phương thức thanh toán", 404);
    }

    await PaymentMethod.delete(req.params.id);
    res.json(ApiResponse.success("Xóa phương thức thanh toán thành công"));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.validatePayment = async (req, res) => {
  try {
    const { methodId } = req.params;
    const { amount } = req.body;

    await PaymentMethod.validatePaymentMethod(methodId, amount);
    res.json(ApiResponse.success("Phương thức thanh toán hợp lệ"));
  } catch (error) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};
