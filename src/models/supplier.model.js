const db = require("../config/database");

class Supplier {
  constructor(supplier) {
    this.id = supplier.id;
    this.Ten = supplier.Ten;
    this.Email = supplier.Email;
    this.SDT = supplier.SDT;
    this.DiaChi = supplier.DiaChi;
    this.MoTa = supplier.MoTa;
    this.TrangThai = supplier.TrangThai || 1;
  }

  async save() {
    const [result] = await db.execute(
      `INSERT INTO nhacungcap (Ten, Email, SDT, DiaChi, MoTa, TrangThai) 
             VALUES (?, ?, ?, ?, ?, ?)`,
      [this.Ten, this.Email, this.SDT, this.DiaChi, this.MoTa, this.TrangThai]
    );
    return result.insertId;
  }

  async update() {
    await db.execute(
      `UPDATE nhacungcap 
             SET Ten = ?, Email = ?, SDT = ?, DiaChi = ?, MoTa = ?, TrangThai = ?
             WHERE id = ?`,
      [
        this.Ten,
        this.Email,
        this.SDT,
        this.DiaChi,
        this.MoTa,
        this.TrangThai,
        this.id,
      ]
    );
  }

  static async getById(id) {
    const [rows] = await db.execute("SELECT * FROM nhacungcap WHERE id = ?", [
      id,
    ]);
    return rows[0];
  }

  static async getAll(filters = {}) {
    let query = "SELECT * FROM nhacungcap WHERE 1=1";
    const values = [];

    if (filters.status !== undefined) {
      query += " AND TrangThai = ?";
      values.push(filters.status);
    }

    if (filters.search) {
      query += " AND (Ten LIKE ? OR Email LIKE ? OR SDT LIKE ?)";
      const searchValue = `%${filters.search}%`;
      values.push(searchValue, searchValue, searchValue);
    }

    const [rows] = await db.execute(query, values);
    return rows;
  }

  static async delete(id) {
    await db.execute("UPDATE nhacungcap SET TrangThai = 0 WHERE id = ?", [id]);
  }

  static async getSupplyHistory(supplierId) {
    const [rows] = await db.execute(
      `SELECT pn.*, 
                    COUNT(ctpn.id) as SoSanPham,
                    GROUP_CONCAT(DISTINCT sp.Ten) as DanhSachSanPham
             FROM phieunhap pn
             LEFT JOIN chitietphieunhap ctpn ON pn.id = ctpn.id_PhieuNhap
             LEFT JOIN sanpham_bien_the spbt ON ctpn.id_SanPham_BienThe = spbt.id
             LEFT JOIN sanpham sp ON spbt.id_SanPham = sp.id
             WHERE pn.id_NhaCungCap = ?
             GROUP BY pn.id
             ORDER BY pn.NgayNhap DESC`,
      [supplierId]
    );
    return rows;
  }
}

module.exports = Supplier;
