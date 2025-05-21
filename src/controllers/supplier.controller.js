const Supplier = require("../models/supplier.model");
const ApiResponse = require("../utils/apiResponse");
const { AppError } = require("../middlewares/error.middleware");

exports.getAllSuppliers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const result = await Supplier.getAll(page, limit, search);

    res.json(ApiResponse.pagination(result.items, page, limit, result.total));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.getById(req.params.id);
    if (!supplier) {
      throw new AppError("Không tìm thấy nhà cung cấp", 404);
    }

    res.json(ApiResponse.success("", supplier));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();

    res
      .status(201)
      .json(ApiResponse.success("Tạo nhà cung cấp thành công", supplier));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const updated = await Supplier.update(req.params.id, req.body);
    if (!updated) {
      throw new AppError("Không tìm thấy nhà cung cấp", 404);
    }

    res.json(ApiResponse.success("Cập nhật nhà cung cấp thành công"));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const deleted = await Supplier.delete(req.params.id);
    if (!deleted) {
      throw new AppError("Không tìm thấy nhà cung cấp", 404);
    }

    res.json(ApiResponse.success("Xóa nhà cung cấp thành công"));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};
