const Color = require("../models/color.model");
const ApiResponse = require("../utils/apiResponse");
const { AppError } = require("../middlewares/error.middleware");

exports.getAllColors = async (req, res) => {
  try {
    const colors = await Color.getAll();
    res.json(ApiResponse.success("", colors));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.getColor = async (req, res) => {
  try {
    const color = await Color.getById(req.params.id);
    if (!color) {
      throw new AppError("Không tìm thấy màu sắc", 404);
    }
    res.json(ApiResponse.success("", color));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.createColor = async (req, res) => {
  try {
    const color = new Color(req.body);
    const id = await color.save();
    res.status(201).json(ApiResponse.success("Tạo màu sắc thành công", { id }));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.updateColor = async (req, res) => {
  try {
    const exists = await Color.getById(req.params.id);
    if (!exists) {
      throw new AppError("Không tìm thấy màu sắc", 404);
    }

    await Color.update(req.params.id, req.body);
    res.json(ApiResponse.success("Cập nhật màu sắc thành công"));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.deleteColor = async (req, res) => {
  try {
    const exists = await Color.getById(req.params.id);
    if (!exists) {
      throw new AppError("Không tìm thấy màu sắc", 404);
    }

    await Color.delete(req.params.id);
    res.json(ApiResponse.success("Xóa màu sắc thành công"));
  } catch (error) {
    const statusCode = error.message.includes("đang được sử dụng")
      ? 400
      : error.statusCode || 500;
    res.status(statusCode).json(ApiResponse.error(error.message));
  }
};
