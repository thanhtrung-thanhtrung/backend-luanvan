const db = require("../config/database");

class Order {
  constructor(order) {
    this.id = order.id;
    this.id_NguoiDung = order.id_NguoiDung;
    this.TenNguoiNhan = order.TenNguoiNhan;
    this.SDTNguoiNhan = order.SDTNguoiNhan;
    this.EmailNguoiNhan = order.EmailNguoiNhan;
    this.DiaChiNhan = order.DiaChiNhan;
    this.GhiChu = order.GhiChu;
    this.TongTien = order.TongTien;
    this.id_HinhThucThanhToan = order.id_HinhThucThanhToan;
    this.id_HinhThucVanChuyen = order.id_HinhThucVanChuyen;
    this.PhiVanChuyen = order.PhiVanChuyen;
    this.MaGiamGia = order.MaGiamGia;
    this.TienGiam = order.TienGiam;
    this.TrangThai = order.TrangThai || "pending";
    this.items = order.items || [];
  }

  async save() {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Insert đơn hàng
      const [result] = await connection.execute(
        `INSERT INTO donhang (
                    id_NguoiDung, TenNguoiNhan, SDTNguoiNhan, EmailNguoiNhan,
                    DiaChiNhan, GhiChu, TongTien, id_HinhThucThanhToan,
                    id_HinhThucVanChuyen, PhiVanChuyen, MaGiamGia, TienGiam, TrangThai
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          this.id_NguoiDung,
          this.TenNguoiNhan,
          this.SDTNguoiNhan,
          this.EmailNguoiNhan,
          this.DiaChiNhan,
          this.GhiChu,
          this.TongTien,
          this.id_HinhThucThanhToan,
          this.id_HinhThucVanChuyen,
          this.PhiVanChuyen,
          this.MaGiamGia,
          this.TienGiam,
          this.TrangThai,
        ]
      );

      const orderId = result.insertId;

      // Insert chi tiết đơn hàng
      for (const item of this.items) {
        await connection.execute(
          `INSERT INTO chitietdonhang (
                        id_DonHang, id_SanPham_BienThe,
                        SoLuong, DonGia, ThanhTien
                    ) VALUES (?, ?, ?, ?, ?)`,
          [
            orderId,
            item.id_SanPham_BienThe,
            item.SoLuong,
            item.DonGia,
            item.SoLuong * item.DonGia,
          ]
        );

        // Cập nhật số lượng trong kho
        await connection.execute(
          "UPDATE sanpham_bien_the SET SoLuong = SoLuong - ? WHERE id = ?",
          [item.SoLuong, item.id_SanPham_BienThe]
        );
      }

      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getById(id) {
    const [rows] = await db.execute(
      `SELECT dh.*, httt.Ten as TenThanhToan, htvc.Ten as TenVanChuyen
             FROM donhang dh
             LEFT JOIN hinhthucthanhtoan httt ON dh.id_HinhThucThanhToan = httt.id
             LEFT JOIN hinhthucvanchuyen htvc ON dh.id_HinhThucVanChuyen = htvc.id
             WHERE dh.id = ?`,
      [id]
    );

    if (rows.length === 0) return null;

    const [items] = await db.execute(
      `SELECT ctdh.*, sp.Ten, sp.HinhAnh, ms.Ten as TenMauSac, kc.Ten as TenKichCo
             FROM chitietdonhang ctdh
             JOIN sanpham_bien_the spbt ON ctdh.id_SanPham_BienThe = spbt.id
             JOIN sanpham sp ON spbt.id_SanPham = sp.id
             JOIN mausac ms ON spbt.id_MauSac = ms.id
             JOIN kichco kc ON spbt.id_KichCo = kc.id
             WHERE ctdh.id_DonHang = ?`,
      [id]
    );

    return {
      ...rows[0],
      items,
    };
  }

  static async getByUser(userId, filters = {}) {
    let query = `
            SELECT dh.*, httt.Ten as TenThanhToan, htvc.Ten as TenVanChuyen
            FROM donhang dh
            LEFT JOIN hinhthucthanhtoan httt ON dh.id_HinhThucThanhToan = httt.id
            LEFT JOIN hinhthucvanchuyen htvc ON dh.id_HinhThucVanChuyen = htvc.id
            WHERE dh.id_NguoiDung = ?
        `;
    const queryParams = [userId];

    if (filters.status) {
      query += " AND dh.TrangThai = ?";
      queryParams.push(filters.status);
    }

    if (filters.startDate) {
      query += " AND DATE(dh.NgayDat) >= ?";
      queryParams.push(filters.startDate);
    }

    if (filters.endDate) {
      query += " AND DATE(dh.NgayDat) <= ?";
      queryParams.push(filters.endDate);
    }

    query += " ORDER BY dh.NgayDat DESC";

    const [orders] = await db.execute(query, queryParams);

    // Get items for each order
    for (const order of orders) {
      const [items] = await db.execute(
        `SELECT ctdh.*, sp.Ten, sp.HinhAnh, ms.Ten as TenMauSac, kc.Ten as TenKichCo
                 FROM chitietdonhang ctdh
                 JOIN sanpham_bien_the spbt ON ctdh.id_SanPham_BienThe = spbt.id
                 JOIN sanpham sp ON spbt.id_SanPham = sp.id
                 JOIN mausac ms ON spbt.id_MauSac = ms.id
                 JOIN kichco kc ON spbt.id_KichCo = kc.id
                 WHERE ctdh.id_DonHang = ?`,
        [order.id]
      );
      order.items = items;
    }

    return orders;
  }

  static async getAllOrders(filters = {}, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    let query = `
            SELECT dh.*, httt.Ten as TenThanhToan, htvc.Ten as TenVanChuyen,
                   nd.HoTen as TenNguoiDat, nd.Email as EmailNguoiDat
            FROM donhang dh
            LEFT JOIN hinhthucthanhtoan httt ON dh.id_HinhThucThanhToan = httt.id
            LEFT JOIN hinhthucvanchuyen htvc ON dh.id_HinhThucVanChuyen = htvc.id
            LEFT JOIN nguoidung nd ON dh.id_NguoiDung = nd.id
            WHERE 1=1
        `;
    const queryParams = [];

    if (filters.status) {
      query += " AND dh.TrangThai = ?";
      queryParams.push(filters.status);
    }

    if (filters.search) {
      query += ` AND (
                dh.TenNguoiNhan LIKE ? OR 
                dh.SDTNguoiNhan LIKE ? OR 
                dh.EmailNguoiNhan LIKE ?
            )`;
      const searchPattern = `%${filters.search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    if (filters.startDate) {
      query += " AND DATE(dh.NgayDat) >= ?";
      queryParams.push(filters.startDate);
    }

    if (filters.endDate) {
      query += " AND DATE(dh.NgayDat) <= ?";
      queryParams.push(filters.endDate);
    }

    // Get total count
    const [countRows] = await db.execute(
      `SELECT COUNT(*) as total FROM (${query}) as counted`,
      queryParams
    );
    const total = countRows[0].total;

    // Get paginated results
    query += " ORDER BY dh.NgayDat DESC LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);

    const [orders] = await db.execute(query, queryParams);

    // Get items for each order
    for (const order of orders) {
      const [items] = await db.execute(
        `SELECT ctdh.*, sp.Ten, sp.HinhAnh, ms.Ten as TenMauSac, kc.Ten as TenKichCo
                 FROM chitietdonhang ctdh
                 JOIN sanpham_bien_the spbt ON ctdh.id_SanPham_BienThe = spbt.id
                 JOIN sanpham sp ON spbt.id_SanPham = sp.id
                 JOIN mausac ms ON spbt.id_MauSac = ms.id
                 JOIN kichco kc ON spbt.id_KichCo = kc.id
                 WHERE ctdh.id_DonHang = ?`,
        [order.id]
      );
      order.items = items;
    }

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async updateStatus(orderId, status, cancelReason = null) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      if (status === "cancelled") {
        // Hoàn lại số lượng sản phẩm vào kho
        await connection.execute(
          `UPDATE sanpham_bien_the spbt
                     JOIN chitietdonhang ctdh ON spbt.id = ctdh.id_SanPham_BienThe
                     SET spbt.SoLuong = spbt.SoLuong + ctdh.SoLuong
                     WHERE ctdh.id_DonHang = ?`,
          [orderId]
        );
      }

      // Cập nhật trạng thái đơn hàng
      await connection.execute(
        "UPDATE donhang SET TrangThai = ?, LyDoHuy = ? WHERE id = ?",
        [status, cancelReason, orderId]
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getOrderStatistics(filters = {}) {
    let query = `
            SELECT 
                COUNT(*) as totalOrders,
                COUNT(CASE WHEN TrangThai = 'pending' THEN 1 END) as pendingOrders,
                COUNT(CASE WHEN TrangThai = 'processing' THEN 1 END) as processingOrders,
                COUNT(CASE WHEN TrangThai = 'shipping' THEN 1 END) as shippingOrders,
                COUNT(CASE WHEN TrangThai = 'completed' THEN 1 END) as completedOrders,
                COUNT(CASE WHEN TrangThai = 'cancelled' THEN 1 END) as cancelledOrders,
                SUM(CASE WHEN TrangThai = 'completed' THEN TongTien ELSE 0 END) as totalRevenue
            FROM donhang
            WHERE 1=1
        `;
    const queryParams = [];

    if (filters.startDate) {
      query += " AND DATE(NgayDat) >= ?";
      queryParams.push(filters.startDate);
    }

    if (filters.endDate) {
      query += " AND DATE(NgayDat) <= ?";
      queryParams.push(filters.endDate);
    }

    const [rows] = await db.execute(query, queryParams);
    return rows[0];
  }
}

module.exports = Order;
