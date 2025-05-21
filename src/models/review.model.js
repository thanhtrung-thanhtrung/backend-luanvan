const db = require("../config/database");

class Review {
  constructor(review) {
    this.id = review.id;
    this.id_SanPham = review.id_SanPham;
    this.id_NguoiDung = review.id_NguoiDung;
    this.id_DonHang = review.id_DonHang;
    this.SoSao = review.SoSao;
    this.NoiDung = review.NoiDung;
    this.HinhAnh = review.HinhAnh;
  }

  async save() {
    const [result] = await db.execute(
      `INSERT INTO danhgia (
                id_SanPham, id_NguoiDung, id_DonHang,
                SoSao, NoiDung, HinhAnh
            ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        this.id_SanPham,
        this.id_NguoiDung,
        this.id_DonHang,
        this.SoSao,
        this.NoiDung,
        this.HinhAnh,
      ]
    );
    return result.insertId;
  }

  static async getByProduct(productId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows] = await db.execute(
      `SELECT dg.*, nd.HoTen, nd.Email
             FROM danhgia dg
             JOIN nguoidung nd ON dg.id_NguoiDung = nd.id
             WHERE dg.id_SanPham = ? AND dg.TrangThai = 1
             ORDER BY dg.NgayDanhGia DESC
             LIMIT ? OFFSET ?`,
      [productId, limit, offset]
    );

    const [count] = await db.execute(
      "SELECT COUNT(*) as total FROM danhgia WHERE id_SanPham = ? AND TrangThai = 1",
      [productId]
    );

    return {
      reviews: rows,
      total: count[0].total,
      page,
      totalPages: Math.ceil(count[0].total / limit),
    };
  }

  static async checkOrderProduct(userId, productId, orderId) {
    const [rows] = await db.execute(
      `SELECT ctdh.id
             FROM chitietdonhang ctdh
             JOIN sanpham_bien_the spbt ON ctdh.id_SanPham_BienThe = spbt.id
             WHERE ctdh.id_DonHang = ? 
             AND spbt.id_SanPham = ?`,
      [orderId, productId]
    );
    return rows.length > 0;
  }

  static async checkExistingReview(userId, productId, orderId) {
    const [rows] = await db.execute(
      "SELECT id FROM danhgia WHERE id_NguoiDung = ? AND id_SanPham = ? AND id_DonHang = ?",
      [userId, productId, orderId]
    );
    return rows.length > 0;
  }

  static async getProductRating(productId) {
    const [rows] = await db.execute(
      `SELECT 
                COUNT(*) as totalReviews,
                AVG(SoSao) as averageRating,
                COUNT(CASE WHEN SoSao = 5 THEN 1 END) as fiveStars,
                COUNT(CASE WHEN SoSao = 4 THEN 1 END) as fourStars,
                COUNT(CASE WHEN SoSao = 3 THEN 1 END) as threeStars,
                COUNT(CASE WHEN SoSao = 2 THEN 1 END) as twoStars,
                COUNT(CASE WHEN SoSao = 1 THEN 1 END) as oneStar
             FROM danhgia
             WHERE id_SanPham = ? AND TrangThai = 1`,
      [productId]
    );
    return rows[0];
  }
}

module.exports = Review;
