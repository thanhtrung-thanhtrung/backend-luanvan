const db = require("../config/database");

class InventoryCheck {
  constructor(data) {
    this.id_NguoiTao = data.id_NguoiTao;
    this.NgayKiemKho = data.NgayKiemKho || new Date();
    this.GhiChu = data.GhiChu;
    this.TrangThai = data.TrangThai || 1;
  }

  async save() {
    const [result] = await db.execute(
      `INSERT INTO kiemkho 
       (id_NguoiTao, NgayKiemKho, GhiChu, TrangThai) 
       VALUES (?, ?, ?, ?)`,
      [this.id_NguoiTao, this.NgayKiemKho, this.GhiChu, this.TrangThai]
    );
    return result.insertId;
  }

  static async addCheckDetail(checkId, variantId, actualQty, systemQty) {
    const difference = actualQty - systemQty;
    await db.execute(
      `INSERT INTO chitietkiemkho 
       (id_KiemKho, id_SanPham_BienThe, SoLuongThucTe, SoLuongHeThong, ChenhLech) 
       VALUES (?, ?, ?, ?, ?)`,
      [checkId, variantId, actualQty, systemQty, difference]
    );
  }

  static async getById(id) {
    const [rows] = await db.execute(
      `SELECT kk.*, nd.HoTen as NguoiTao 
       FROM kiemkho kk
       JOIN nguoidung nd ON kk.id_NguoiTao = nd.id
       WHERE kk.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async getDetails(checkId) {
    const [rows] = await db.execute(
      `SELECT ctkk.*, spbt.SKU, sp.Ten as TenSanPham, 
              ms.Ten as TenMauSac, kc.Ten as TenKichCo
       FROM chitietkiemkho ctkk
       JOIN sanpham_bien_the spbt ON ctkk.id_SanPham_BienThe = spbt.id
       JOIN sanpham sp ON spbt.id_SanPham = sp.id
       JOIN mausac ms ON spbt.id_MauSac = ms.id
       JOIN kichco kc ON spbt.id_KichCo = kc.id
       WHERE ctkk.id_KiemKho = ?`,
      [checkId]
    );
    return rows;
  }

  static async getAll(filters = {}) {
    let query = `
      SELECT kk.*, nd.HoTen as NguoiTao,
             COUNT(DISTINCT ctkk.id) as SoSanPham,
             SUM(ABS(ctkk.ChenhLech)) as TongChenhLech
      FROM kiemkho kk
      JOIN nguoidung nd ON kk.id_NguoiTao = nd.id
      LEFT JOIN chitietkiemkho ctkk ON kk.id = ctkk.id_KiemKho
    `;

    const conditions = [];
    const params = [];

    if (filters.startDate) {
      conditions.push("kk.NgayKiemKho >= ?");
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      conditions.push("kk.NgayKiemKho <= ?");
      params.push(filters.endDate);
    }

    if (conditions.length) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " GROUP BY kk.id ORDER BY kk.NgayKiemKho DESC";

    const [rows] = await db.execute(query, params);
    return rows;
  }
}

module.exports = InventoryCheck;
