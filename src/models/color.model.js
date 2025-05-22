const db = require("../config/database");

class Color {
  constructor(color) {
    this.id = color.id;
    this.Ten = color.Ten;
    this.MaMau = color.MaMau;
  }

  async save() {
    const [result] = await db.execute(
      "INSERT INTO mausac (Ten, MaMau) VALUES (?, ?)",
      [this.Ten, this.MaMau]
    );
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await db.execute("SELECT * FROM mausac ORDER BY Ten");
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute("SELECT * FROM mausac WHERE id = ?", [id]);
    return rows[0];
  }

  static async update(id, data) {
    await db.execute("UPDATE mausac SET Ten = ?, MaMau = ? WHERE id = ?", [
      data.Ten,
      data.MaMau,
      id,
    ]);
  }

  static async delete(id) {
    // Check if color is used in any product variants
    const [variants] = await db.execute(
      "SELECT COUNT(*) as count FROM sanpham_bien_the WHERE id_MauSac = ?",
      [id]
    );

    if (variants[0].count > 0) {
      throw new Error("Không thể xóa màu sắc đang được sử dụng trong sản phẩm");
    }

    await db.execute("DELETE FROM mausac WHERE id = ?", [id]);
  }
}

module.exports = Color;
