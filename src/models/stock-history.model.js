const db = require("../config/database");

class StockHistory {
  constructor(history) {
    this.id = history.id;
    this.id_SanPham_BienThe = history.id_SanPham_BienThe;
    this.LoaiPhieu = history.LoaiPhieu; // 'nhap' hoặc 'xuat'
    this.SoLuong = history.SoLuong;
    this.GhiChu = history.GhiChu;
    this.id_NguoiTao = history.id_NguoiTao;
    this.id_PhieuNhap = history.id_PhieuNhap;
    this.id_DonHang = history.id_DonHang;
  }

  async save() {
    const [result] = await db.execute(
      `INSERT INTO lichsu_kho 
       (id_SanPham_BienThe, LoaiPhieu, SoLuong, GhiChu, id_NguoiTao, id_PhieuNhap, id_DonHang) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        this.id_SanPham_BienThe,
        this.LoaiPhieu,
        this.SoLuong,
        this.GhiChu,
        this.id_NguoiTao,
        this.id_PhieuNhap,
        this.id_DonHang,
      ]
    );
    return result.insertId;
  }

  static async getHistory(filters = {}) {
    let query = `
      SELECT 
        lsk.*,
        spbt.SKU,
        sp.Ten as TenSanPham,
        ms.Ten as TenMauSac,
        kc.Ten as TenKichCo,
        nd.HoTen as NguoiTao
      FROM lichsu_kho lsk
      JOIN sanpham_bien_the spbt ON lsk.id_SanPham_BienThe = spbt.id
      JOIN sanpham sp ON spbt.id_SanPham = sp.id
      JOIN mausac ms ON spbt.id_MauSac = ms.id
      JOIN kichco kc ON spbt.id_KichCo = kc.id
      JOIN nguoidung nd ON lsk.id_NguoiTao = nd.id
      WHERE 1=1
    `;
    const values = [];

    if (filters.productId) {
      query += " AND sp.id = ?";
      values.push(filters.productId);
    }

    if (filters.type) {
      query += " AND lsk.LoaiPhieu = ?";
      values.push(filters.type);
    }

    if (filters.startDate) {
      query += " AND lsk.NgayTao >= ?";
      values.push(filters.startDate);
    }

    if (filters.endDate) {
      query += " AND lsk.NgayTao <= ?";
      values.push(filters.endDate);
    }

    query += " ORDER BY lsk.NgayTao DESC";

    if (filters.limit) {
      query += " LIMIT ?";
      values.push(parseInt(filters.limit));
    }

    if (filters.offset) {
      query += " OFFSET ?";
      values.push(parseInt(filters.offset));
    }

    const [rows] = await db.execute(query, values);
    return rows;
  }

  static async getStockAlerts(threshold = 10) {
    const [rows] = await db.execute(
      `SELECT 
        spbt.*,
        sp.Ten as TenSanPham,
        ms.Ten as TenMauSac,
        kc.Ten as TenKichCo
       FROM sanpham_bien_the spbt
       JOIN sanpham sp ON spbt.id_SanPham = sp.id
       JOIN mausac ms ON spbt.id_MauSac = ms.id
       JOIN kichco kc ON spbt.id_KichCo = kc.id
       WHERE spbt.SoLuong <= ?
       ORDER BY spbt.SoLuong ASC`,
      [threshold]
    );
    return rows;
  }
}

module.exports = StockHistory;
