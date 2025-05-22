const db = require("../config/database");

class PaymentMethod {
  constructor(method) {
    this.id = method.id;
    this.Ten = method.Ten;
    this.MoTa = method.MoTa;
    this.HinhAnh = method.HinhAnh;
    this.TrangThai = method.TrangThai || 1;
  }

  async save() {
    const [result] = await db.execute(
      "INSERT INTO hinhthucthanhtoan (Ten, MoTa, HinhAnh, TrangThai) VALUES (?, ?, ?, ?)",
      [this.Ten, this.MoTa, this.HinhAnh, this.TrangThai]
    );
    return result.insertId;
  }

  static async getAll(onlyActive = true) {
    let query = "SELECT * FROM hinhthucthanhtoan";
    if (onlyActive) {
      query += " WHERE TrangThai = 1";
    }
    const [rows] = await db.execute(query);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute(
      "SELECT * FROM hinhthucthanhtoan WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  static async update(id, data) {
    await db.execute(
      "UPDATE hinhthucthanhtoan SET Ten = ?, MoTa = ?, HinhAnh = ?, TrangThai = ? WHERE id = ?",
      [data.Ten, data.MoTa, data.HinhAnh, data.TrangThai, id]
    );
  }

  static async delete(id) {
    await db.execute(
      "UPDATE hinhthucthanhtoan SET TrangThai = 0 WHERE id = ?",
      [id]
    );
  }

  static async validatePaymentMethod(methodId, amount) {
    const [method] = await db.execute(
      "SELECT * FROM hinhthucthanhtoan WHERE id = ? AND TrangThai = 1",
      [methodId]
    );

    if (!method[0]) {
      throw new Error("Phương thức thanh toán không hợp lệ");
    }

    // Có thể thêm các validation khác như:
    // - Kiểm tra hạn mức thanh toán
    // - Kiểm tra thời gian hoạt động
    // - Kiểm tra các điều kiện đặc biệt
    return true;
  }
}

module.exports = PaymentMethod;
