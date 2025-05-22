const ShippingMethod = require("../models/shipping.model");
const ApiResponse = require("../utils/apiResponse");
const { AppError } = require("../middlewares/error.middleware");

exports.getAllShippingMethods = async (req, res) => {
  try {
    const onlyActive = req.query.all !== "true";
    const methods = await ShippingMethod.getAll(onlyActive);
    res.json(ApiResponse.success("", methods));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.getShippingMethod = async (req, res) => {
  try {
    const method = await ShippingMethod.getById(req.params.id);
    if (!method) {
      throw new AppError("Không tìm thấy phương thức vận chuyển", 404);
    }
    res.json(ApiResponse.success("", method));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.createShippingMethod = async (req, res) => {
  try {
    const method = new ShippingMethod(req.body);
    const id = await method.save();
    res
      .status(201)
      .json(
        ApiResponse.success("Tạo phương thức vận chuyển thành công", { id })
      );
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.updateShippingMethod = async (req, res) => {
  try {
    const exists = await ShippingMethod.getById(req.params.id);
    if (!exists) {
      throw new AppError("Không tìm thấy phương thức vận chuyển", 404);
    }

    await ShippingMethod.update(req.params.id, req.body);
    res.json(ApiResponse.success("Cập nhật phương thức vận chuyển thành công"));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.deleteShippingMethod = async (req, res) => {
  try {
    const exists = await ShippingMethod.getById(req.params.id);
    if (!exists) {
      throw new AppError("Không tìm thấy phương thức vận chuyển", 404);
    }

    await ShippingMethod.delete(req.params.id);
    res.json(ApiResponse.success("Xóa phương thức vận chuyển thành công"));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.calculateShippingFee = async (req, res) => {
  try {
    const { methodId } = req.params;
    const orderInfo = req.body;

    const fee = await ShippingMethod.calculateShippingFee(methodId, orderInfo);
    res.json(ApiResponse.success("", { fee }));
  } catch (error) {
    res.status(400).json(ApiResponse.error(error.message));
  }
};
