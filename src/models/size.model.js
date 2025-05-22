const db = require("../config/database");

class Size {
  constructor(size) {
    this.id = size.id;
    this.Ten = size.Ten;
  }

  async save() {
    const [result] = await db.execute("INSERT INTO kichco (Ten) VALUES (?)", [
      this.Ten,
    ]);
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await db.execute("SELECT * FROM kichco ORDER BY Ten");
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute("SELECT * FROM kichco WHERE id = ?", [id]);
    return rows[0];
  }

  static async update(id, data) {
    await db.execute("UPDATE kichco SET Ten = ? WHERE id = ?", [data.Ten, id]);
  }

  static async delete(id) {
    // Check if size is used in any product variants
    const [variants] = await db.execute(
      "SELECT COUNT(*) as count FROM sanpham_bien_the WHERE id_KichCo = ?",
      [id]
    );

    if (variants[0].count > 0) {
      throw new Error("Không thể xóa kích cỡ đang được sử dụng trong sản phẩm");
    }

    await db.execute("DELETE FROM kichco WHERE id = ?", [id]);
  }

  static async getSizeStats() {
    const [rows] = await db.execute(`
      SELECT 
        kc.*,
        COUNT(DISTINCT spbt.id_SanPham) as SoSanPham,
        SUM(spbt.SoLuong) as TongTonKho,
        COUNT(DISTINCT ctdh.id_DonHang) as SoDonHang,
        SUM(ctdh.SoLuong) as SoLuongDaBan
      FROM kichco kc
      LEFT JOIN sanpham_bien_the spbt ON kc.id = spbt.id_KichCo
      LEFT JOIN chitietdonhang ctdh ON spbt.id = ctdh.id_SanPham_BienThe
      GROUP BY kc.id
      ORDER BY SoLuongDaBan DESC
    `);
    return rows;
  }

  static async getMostPopularSizes(limit = 5) {
    const [rows] = await db.execute(
      `
      SELECT 
        kc.*, 
        COUNT(ctdh.id) as SoLuongBan
      FROM kichco kc
      JOIN sanpham_bien_the spbt ON kc.id = spbt.id_KichCo
      JOIN chitietdonhang ctdh ON spbt.id = ctdh.id_SanPham_BienThe
      GROUP BY kc.id
      ORDER BY SoLuongBan DESC
      LIMIT ?
    `,
      [limit]
    );
    return rows;
  }

  static async getLowStockSizes(threshold = 10) {
    const [rows] = await db.execute(
      `
      SELECT 
        kc.*, 
        COUNT(DISTINCT spbt.id_SanPham) as SoSanPham,
        SUM(spbt.SoLuong) as TongTonKho
      FROM kichco kc
      JOIN sanpham_bien_the spbt ON kc.id = spbt.id_KichCo
      GROUP BY kc.id
      HAVING TongTonKho < ?
      ORDER BY TongTonKho ASC
    `,
      [threshold]
    );
    return rows;
  }
}

module.exports = Size;
