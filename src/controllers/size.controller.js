const Size = require("../models/size.model");
const ApiResponse = require("../utils/apiResponse");
const { AppError } = require("../middlewares/error.middleware");

exports.getAllSizes = async (req, res) => {
  try {
    const sizes = await Size.getAll();
    res.json(ApiResponse.success("", sizes));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.getSize = async (req, res) => {
  try {
    const size = await Size.getById(req.params.id);
    if (!size) {
      throw new AppError("Không tìm thấy kích cỡ", 404);
    }
    res.json(ApiResponse.success("", size));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.createSize = async (req, res) => {
  try {
    const size = new Size(req.body);
    const id = await size.save();
    res.status(201).json(ApiResponse.success("Tạo kích cỡ thành công", { id }));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.updateSize = async (req, res) => {
  try {
    const exists = await Size.getById(req.params.id);
    if (!exists) {
      throw new AppError("Không tìm thấy kích cỡ", 404);
    }

    await Size.update(req.params.id, req.body);
    res.json(ApiResponse.success("Cập nhật kích cỡ thành công"));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.deleteSize = async (req, res) => {
  try {
    const exists = await Size.getById(req.params.id);
    if (!exists) {
      throw new AppError("Không tìm thấy kích cỡ", 404);
    }

    await Size.delete(req.params.id);
    res.json(ApiResponse.success("Xóa kích cỡ thành công"));
  } catch (error) {
    const statusCode = error.message.includes("đang được sử dụng")
      ? 400
      : error.statusCode || 500;
    res.status(statusCode).json(ApiResponse.error(error.message));
  }
};

exports.getSizeStats = async (req, res) => {
  try {
    const stats = await Size.getSizeStats();
    res.json(ApiResponse.success("", stats));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.getMostPopularSizes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const sizes = await Size.getMostPopularSizes(limit);
    res.json(ApiResponse.success("", sizes));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.getLowStockSizes = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const sizes = await Size.getLowStockSizes(threshold);
    res.json(ApiResponse.success("", sizes));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};
