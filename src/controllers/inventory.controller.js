const Inventory = require("../models/inventory.model");
const StockHistory = require("../models/stock-history.model");
const InventoryCheck = require("../models/inventory-check.model");
const { AppError } = require("../middlewares/error.middleware");
const ApiResponse = require("../utils/apiResponse");

exports.createStockEntry = async (req, res) => {
  try {
    const stockEntry = {
      id_NguoiDung: req.user.id,
      id_NhaCungCap: req.body.supplierId,
      TongSoLuong: req.body.items.reduce((sum, item) => sum + item.SoLuong, 0),
      TongTien: req.body.items.reduce(
        (sum, item) => sum + item.SoLuong * item.DonGia,
        0
      ),
      GhiChu: req.body.note,
      items: req.body.items,
    };

    const stockEntryId = await Inventory.createStockEntry(stockEntry);

    res.status(201).json({
      status: "success",
      message: "Tạo phiếu nhập kho thành công",
      data: { id: stockEntryId },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getStockEntries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      supplierId: req.query.supplierId,
    };

    const entries = await Inventory.getStockEntries(filters, page, limit);

    res.json({
      status: "success",
      data: entries,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getStockEntryDetails = async (req, res) => {
  try {
    const details = await Inventory.getStockEntryDetails(req.params.id);

    res.json({
      status: "success",
      data: details,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getInventoryStats = async (req, res) => {
  try {
    const stats = await Inventory.getInventoryStats();

    res.json({
      status: "success",
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getLowStockProducts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const products = await Inventory.getLowStockProducts(threshold);

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

exports.getStockHistory = async (req, res) => {
  try {
    const filters = {
      productId: req.query.productId,
      type: req.query.type,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit,
      offset: req.query.offset,
    };

    const history = await StockHistory.getHistory(filters);
    res.json(ApiResponse.success("", history));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.getStockAlerts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const alerts = await StockHistory.getStockAlerts(threshold);
    res.json(ApiResponse.success("", alerts));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.createInventoryCheck = async (req, res) => {
  try {
    const checkCode = await InventoryCheck.generateCheckCode();

    const check = new InventoryCheck({
      MaKiemKho: checkCode,
      NgayKiemKho: new Date(),
      id_NguoiKiemKho: req.user.id,
      GhiChu: req.body.GhiChu,
    });

    const id = await check.save();

    if (req.body.details && req.body.details.length > 0) {
      await check.addDetail(req.body.details);
    }

    res.status(201).json(
      ApiResponse.success("Tạo phiếu kiểm kho thành công", {
        id,
        MaKiemKho: checkCode,
      })
    );
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.getInventoryCheck = async (req, res) => {
  try {
    const check = await InventoryCheck.getById(req.params.id);
    if (!check) {
      throw new AppError("Không tìm thấy phiếu kiểm kho", 404);
    }

    const details = await InventoryCheck.getDetails(req.params.id);
    check.ChiTiet = details;

    res.json(ApiResponse.success("", check));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.getAllInventoryChecks = async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      status: req.query.status,
      limit: req.query.limit,
      offset: req.query.offset,
    };

    const checks = await InventoryCheck.getAll(filters);
    res.json(ApiResponse.success("", checks));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.updateInventoryCheckStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (![1, 2, 3].includes(status)) {
      throw new AppError("Trạng thái không hợp lệ", 400);
    }

    const check = await InventoryCheck.getById(req.params.id);
    if (!check) {
      throw new AppError("Không tìm thấy phiếu kiểm kho", 404);
    }

    if (check.TrangThai === 2) {
      throw new AppError(
        "Không thể cập nhật phiếu kiểm kho đã hoàn thành",
        400
      );
    }

    await InventoryCheck.updateStatus(req.params.id, status, req.user.id);

    res.json(ApiResponse.success("Cập nhật trạng thái kiểm kho thành công"));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.addInventoryCheckDetail = async (req, res) => {
  try {
    const check = await InventoryCheck.getById(req.params.id);
    if (!check) {
      throw new AppError("Không tìm thấy phiếu kiểm kho", 404);
    }

    if (check.TrangThai !== 1) {
      throw new AppError(
        "Chỉ có thể thêm chi tiết cho phiếu đang kiểm kho",
        400
      );
    }

    await check.addDetail(req.body.details);

    res.json(ApiResponse.success("Thêm chi tiết kiểm kho thành công"));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};
