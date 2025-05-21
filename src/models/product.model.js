const db = require("../config/database");

class Product {
  constructor(product) {
    this.id = product.id;
    this.Ten = product.Ten;
    this.MoTa = product.MoTa;
    this.MoTaChiTiet = product.MoTaChiTiet;
    this.ThongSoKyThuat = product.ThongSoKyThuat;
    this.Gia = product.Gia;
    this.GiaKhuyenMai = product.GiaKhuyenMai;
    this.SoLuong = product.SoLuong;
    this.id_DanhMuc = product.id_DanhMuc;
    this.id_ThuongHieu = product.id_ThuongHieu;
    this.id_NhaCungCap = product.id_NhaCungCap;
    this.HinhAnh = product.HinhAnh;
    this.TrangThai = product.TrangThai || 1;
  }

  static async getAll(filters = {}) {
    let query = "SELECT * FROM sanpham WHERE TrangThai = 1";
    const values = [];

    if (filters.categoryId) {
      query += " AND id_DanhMuc = ?";
      values.push(filters.categoryId);
    }

    if (filters.brandId) {
      query += " AND id_ThuongHieu = ?";
      values.push(filters.brandId);
    }

    if (filters.priceMin) {
      query += " AND Gia >= ?";
      values.push(filters.priceMin);
    }

    if (filters.priceMax) {
      query += " AND Gia <= ?";
      values.push(filters.priceMax);
    }

    const [rows] = await db.execute(query, values);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute(
      "SELECT * FROM sanpham WHERE id = ? AND TrangThai = 1",
      [id]
    );
    return rows[0];
  }

  static async getVariants(productId) {
    const [rows] = await db.execute(
      `
            SELECT spbt.*, kc.Ten as TenKichCo, ms.Ten as TenMauSac 
            FROM sanpham_bien_the spbt
            JOIN kichco kc ON spbt.id_KichCo = kc.id
            JOIN mausac ms ON spbt.id_MauSac = ms.id
            WHERE spbt.id_SanPham = ?
        `,
      [productId]
    );
    return rows;
  }

  async save() {
    const [result] = await db.execute(
      "INSERT INTO sanpham (Ten, MoTa, MoTaChiTiet, ThongSoKyThuat, Gia, GiaKhuyenMai, SoLuong, id_DanhMuc, id_ThuongHieu, id_NhaCungCap, HinhAnh, TrangThai) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        this.Ten,
        this.MoTa,
        this.MoTaChiTiet,
        this.ThongSoKyThuat,
        this.Gia,
        this.GiaKhuyenMai,
        this.SoLuong,
        this.id_DanhMuc,
        this.id_ThuongHieu,
        this.id_NhaCungCap,
        this.HinhAnh,
        this.TrangThai,
      ]
    );
    return result.insertId;
  }

  async update() {
    await db.execute(
      "UPDATE sanpham SET Ten = ?, MoTa = ?, MoTaChiTiet = ?, ThongSoKyThuat = ?, Gia = ?, GiaKhuyenMai = ?, SoLuong = ?, id_DanhMuc = ?, id_ThuongHieu = ?, id_NhaCungCap = ?, HinhAnh = ?, TrangThai = ? WHERE id = ?",
      [
        this.Ten,
        this.MoTa,
        this.MoTaChiTiet,
        this.ThongSoKyThuat,
        this.Gia,
        this.GiaKhuyenMai,
        this.SoLuong,
        this.id_DanhMuc,
        this.id_ThuongHieu,
        this.id_NhaCungCap,
        this.HinhAnh,
        this.TrangThai,
        this.id,
      ]
    );
  }

  static async delete(id) {
    await db.execute("UPDATE sanpham SET TrangThai = 0 WHERE id = ?", [id]);
  }

  static async search(keyword) {
    const [rows] = await db.execute(
      "SELECT * FROM sanpham WHERE TrangThai = 1 AND (Ten LIKE ? OR MoTa LIKE ?)",
      [`%${keyword}%`, `%${keyword}%`]
    );
    return rows;
  }
}

module.exports = Product;
