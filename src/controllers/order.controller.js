const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const ApiResponse = require("../utils/apiResponse");
const { AppError } = require("../middlewares/error.middleware");

exports.createOrder = async (req, res) => {
  try {
    // Lấy giỏ hàng hiện tại
    let cart;
    if (req.user) {
      cart = await Cart.loadFromDatabase(req.user.id);
    } else {
      cart = new Cart(req.session.cart);
    }

    if (cart.totalQty === 0) {
      throw new AppError("Giỏ hàng trống", 400);
    }

    // Tạo danh sách items từ giỏ hàng
    const items = cart.generateArray().map((item) => ({
      id_SanPham_BienThe: item.item.variant.id,
      SoLuong: item.qty,
      DonGia: item.item.GiaKhuyenMai || item.item.Gia,
    }));

    // Tạo đơn hàng mới
    const order = new Order({
      id_NguoiDung: req.user?.id,
      ...req.body,
      TongTien:
        cart.totalPrice +
        (req.body.PhiVanChuyen || 0) -
        (req.body.TienGiam || 0),
      items,
    });

    // Lưu đơn hàng
    const orderId = await order.save();

    // Xóa giỏ hàng
    if (req.user) {
      const emptyCart = new Cart();
      await emptyCart.save(req.user.id);
    }
    req.session.cart = null;

    res
      .status(201)
      .json(ApiResponse.success("Đặt hàng thành công", { orderId }));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      status: req.query.status,
      search: req.query.search,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const result = await Order.getAllOrders(filters, page, limit);

    res.json(ApiResponse.pagination(result.orders, page, limit, result.total));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const orders = await Order.getByUser(req.user.id, filters);

    res.json(ApiResponse.success("", orders));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.getById(req.params.id);

    if (!order) {
      throw new AppError("Không tìm thấy đơn hàng", 404);
    }

    // Kiểm tra quyền truy cập
    if (!req.user.isAdmin && order.id_NguoiDung !== req.user.id) {
      throw new AppError("Không có quyền truy cập đơn hàng này", 403);
    }

    res.json(ApiResponse.success("", order));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, cancelReason } = req.body;
    const orderId = req.params.id;

    const order = await Order.getById(orderId);
    if (!order) {
      throw new AppError("Không tìm thấy đơn hàng", 404);
    }

    // Kiểm tra quyền cập nhật
    if (!req.user.isAdmin) {
      // Khách hàng chỉ có thể hủy đơn hàng ở trạng thái pending
      if (
        status !== "cancelled" ||
        order.TrangThai !== "pending" ||
        order.id_NguoiDung !== req.user.id
      ) {
        throw new AppError("Không có quyền cập nhật đơn hàng này", 403);
      }
    }

    await Order.updateStatus(orderId, status, cancelReason);

    res.json(ApiResponse.success("Cập nhật trạng thái đơn hàng thành công"));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await Order.updatePaymentStatus(req.params.id, status);

    res.json(ApiResponse.success("Cập nhật trạng thái thanh toán thành công"));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.getOrderStatistics = async (req, res) => {
  try {
    // Chỉ admin mới có quyền xem thống kê
    if (!req.user.isAdmin) {
      throw new AppError("Không có quyền truy cập", 403);
    }

    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const stats = await Order.getOrderStatistics(filters);

    res.json(ApiResponse.success("", stats));
  } catch (error) {
    res.status(error.statusCode || 500).json(ApiResponse.error(error.message));
  }
};
