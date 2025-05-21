const Inventory = require("../models/inventory.model");

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
