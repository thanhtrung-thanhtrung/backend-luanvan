const db = require("../config/database");

class Inventory {
  static async createStockEntry(stockEntry) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Insert phiếu nhập
      const [result] = await connection.execute(
        `INSERT INTO phieunhap (
                    id_NguoiDung, id_NhaCungCap, NgayNhap, 
                    TongSoLuong, TongTien, GhiChu
                ) VALUES (?, ?, NOW(), ?, ?, ?)`,
        [
          stockEntry.id_NguoiDung,
          stockEntry.id_NhaCungCap,
          stockEntry.TongSoLuong,
          stockEntry.TongTien,
          stockEntry.GhiChu,
        ]
      );

      const stockEntryId = result.insertId;

      // Insert chi tiết phiếu nhập
      for (const item of stockEntry.items) {
        await connection.execute(
          `INSERT INTO chitietphieunhap (
                        id_PhieuNhap, id_SanPham_BienThe,
                        SoLuong, DonGia, ThanhTien
                    ) VALUES (?, ?, ?, ?, ?)`,
          [
            stockEntryId,
            item.id_SanPham_BienThe,
            item.SoLuong,
            item.DonGia,
            item.SoLuong * item.DonGia,
          ]
        );

        // Cập nhật số lượng trong kho
        await connection.execute(
          "UPDATE sanpham_bien_the SET SoLuong = SoLuong + ? WHERE id = ?",
          [item.SoLuong, item.id_SanPham_BienThe]
        );
      }

      await connection.commit();
      return stockEntryId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getStockEntries(filters = {}, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    let query = `
            SELECT pn.*, nd.HoTen as NguoiNhap, ncc.Ten as NhaCungCap
            FROM phieunhap pn
            JOIN nguoidung nd ON pn.id_NguoiDung = nd.id
            LEFT JOIN nhacungcap ncc ON pn.id_NhaCungCap = ncc.id
            WHERE 1=1
        `;
    const values = [];

    if (filters.startDate) {
      query += " AND DATE(pn.NgayNhap) >= ?";
      values.push(filters.startDate);
    }

    if (filters.endDate) {
      query += " AND DATE(pn.NgayNhap) <= ?";
      values.push(filters.endDate);
    }

    if (filters.supplierId) {
      query += " AND pn.id_NhaCungCap = ?";
      values.push(filters.supplierId);
    }

    query += " ORDER BY pn.NgayNhap DESC LIMIT ? OFFSET ?";
    values.push(limit, offset);

    const [rows] = await db.execute(query, values);
    return rows;
  }

  static async getStockEntryDetails(stockEntryId) {
    const [rows] = await db.execute(
      `SELECT ctpn.*, sp.Ten as TenSanPham,
                    spbt.id_KichCo, spbt.id_MauSac
             FROM chitietphieunhap ctpn
             JOIN sanpham_bien_the spbt ON ctpn.id_SanPham_BienThe = spbt.id
             JOIN sanpham sp ON spbt.id_SanPham = sp.id
             WHERE ctpn.id_PhieuNhap = ?`,
      [stockEntryId]
    );
    return rows;
  }

  static async getInventoryStats() {
    const [rows] = await db.execute(`
            SELECT 
                sp.id,
                sp.Ten,
                SUM(spbt.SoLuong) as TongTonKho,
                COUNT(DISTINCT dh.id) as TongDonHang,
                SUM(ctdh.SoLuong) as TongDaBan
            FROM sanpham sp
            LEFT JOIN sanpham_bien_the spbt ON sp.id = spbt.id_SanPham
            LEFT JOIN chitietdonhang ctdh ON spbt.id = ctdh.id_SanPham_BienThe
            LEFT JOIN donhang dh ON ctdh.id_DonHang = dh.id AND dh.TrangThai = 'completed'
            GROUP BY sp.id, sp.Ten
        `);
    return rows;
  }

  static async getLowStockProducts(threshold = 10) {
    const [rows] = await db.execute(
      `SELECT sp.*, spbt.SoLuong, spbt.id_KichCo, spbt.id_MauSac
             FROM sanpham_bien_the spbt
             JOIN sanpham sp ON spbt.id_SanPham = sp.id
             WHERE spbt.SoLuong <= ?
             ORDER BY spbt.SoLuong ASC`,
      [threshold]
    );
    return rows;
  }
}

module.exports = Inventory;
