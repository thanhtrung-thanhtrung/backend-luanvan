const db = require("../config/database");

class Wishlist {
  constructor(wishlist) {
    this.id_NguoiDung = wishlist.id_NguoiDung;
    this.id_SanPham = wishlist.id_SanPham;
  }

  async save() {
    const [result] = await db.execute(
      "INSERT INTO yeuthich (id_NguoiDung, id_SanPham) VALUES (?, ?)",
      [this.id_NguoiDung, this.id_SanPham]
    );
    return result.insertId;
  }

  static async delete(userId, productId) {
    const [result] = await db.execute(
      "DELETE FROM yeuthich WHERE id_NguoiDung = ? AND id_SanPham = ?",
      [userId, productId]
    );
    return result.affectedRows > 0;
  }

  static async getByUser(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    // Get total count
    const [countRows] = await db.execute(
      "SELECT COUNT(*) as total FROM yeuthich WHERE id_NguoiDung = ?",
      [userId]
    );
    const total = countRows[0].total;

    // Get paginated wishlist items with product details
    const [rows] = await db.execute(
      `SELECT yt.*, sp.*, dm.Ten as TenDanhMuc,
                    GROUP_CONCAT(DISTINCT ms.Ten) as MauSac,
                    GROUP_CONCAT(DISTINCT kc.Ten) as KichCo
             FROM yeuthich yt
             JOIN sanpham sp ON yt.id_SanPham = sp.id
             LEFT JOIN danhmuc dm ON sp.id_DanhMuc = dm.id
             LEFT JOIN sanpham_bien_the spbt ON sp.id = spbt.id_SanPham
             LEFT JOIN mausac ms ON spbt.id_MauSac = ms.id
             LEFT JOIN kichco kc ON spbt.id_KichCo = kc.id
             WHERE yt.id_NguoiDung = ?
             GROUP BY sp.id
             ORDER BY yt.NgayThem DESC
             LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    return {
      items: rows.map((row) => ({
        ...row,
        MauSac: row.MauSac ? row.MauSac.split(",") : [],
        KichCo: row.KichCo ? row.KichCo.split(",") : [],
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async exists(userId, productId) {
    const [rows] = await db.execute(
      "SELECT 1 FROM yeuthich WHERE id_NguoiDung = ? AND id_SanPham = ?",
      [userId, productId]
    );
    return rows.length > 0;
  }

  static async getPopularProducts(limit = 10) {
    const [rows] = await db.execute(
      `SELECT sp.*, COUNT(yt.id_SanPham) as WishlistCount,
                    dm.Ten as TenDanhMuc,
                    GROUP_CONCAT(DISTINCT ms.Ten) as MauSac,
                    GROUP_CONCAT(DISTINCT kc.Ten) as KichCo
             FROM yeuthich yt
             JOIN sanpham sp ON yt.id_SanPham = sp.id
             LEFT JOIN danhmuc dm ON sp.id_DanhMuc = dm.id
             LEFT JOIN sanpham_bien_the spbt ON sp.id = spbt.id_SanPham
             LEFT JOIN mausac ms ON spbt.id_MauSac = ms.id
             LEFT JOIN kichco kc ON spbt.id_KichCo = kc.id
             GROUP BY sp.id
             ORDER BY WishlistCount DESC
             LIMIT ?`,
      [limit]
    );

    return rows.map((row) => ({
      ...row,
      MauSac: row.MauSac ? row.MauSac.split(",") : [],
      KichCo: row.KichCo ? row.KichCo.split(",") : [],
    }));
  }
}

module.exports = Wishlist;
