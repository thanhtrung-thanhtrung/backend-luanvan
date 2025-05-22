const db = require("../config/database");

class ShippingMethod {
  constructor(method) {
    this.id = method.id;
    this.Ten = method.Ten;
    this.MoTa = method.MoTa;
    this.PhiVanChuyen = method.PhiVanChuyen;
    this.TrangThai = method.TrangThai || 1;
  }

  async save() {
    const [result] = await db.execute(
      "INSERT INTO hinhthucvanchuyen (Ten, MoTa, PhiVanChuyen, TrangThai) VALUES (?, ?, ?, ?)",
      [this.Ten, this.MoTa, this.PhiVanChuyen, this.TrangThai]
    );
    return result.insertId;
  }

  static async getAll(onlyActive = true) {
    let query = "SELECT * FROM hinhthucvanchuyen";
    if (onlyActive) {
      query += " WHERE TrangThai = 1";
    }
    query += " ORDER BY PhiVanChuyen ASC";

    const [rows] = await db.execute(query);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute(
      "SELECT * FROM hinhthucvanchuyen WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  static async update(id, data) {
    await db.execute(
      "UPDATE hinhthucvanchuyen SET Ten = ?, MoTa = ?, PhiVanChuyen = ?, TrangThai = ? WHERE id = ?",
      [data.Ten, data.MoTa, data.PhiVanChuyen, data.TrangThai, id]
    );
  }

  static async delete(id) {
    await db.execute(
      "UPDATE hinhthucvanchuyen SET TrangThai = 0 WHERE id = ?",
      [id]
    );
  }

  static async calculateShippingFee(methodId, orderInfo) {
    const [method] = await db.execute(
      "SELECT * FROM hinhthucvanchuyen WHERE id = ? AND TrangThai = 1",
      [methodId]
    );

    if (!method[0]) {
      throw new Error("Phương thức vận chuyển không hợp lệ");
    }

    // Ở đây có thể thêm logic tính phí vận chuyển dựa trên:
    // - Khoảng cách
    // - Trọng lượng đơn hàng
    // - Giá trị đơn hàng
    // - Địa chỉ giao hàng
    // Hiện tại return phí cố định
    return method[0].PhiVanChuyen;
  }
}

module.exports = ShippingMethod;
