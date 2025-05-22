const db = require("../config/database");
const slugify = require("slugify");

class Brand {
  constructor(brand) {
    this.id = brand.id;
    this.Ten = brand.Ten;
    this.MoTa = brand.MoTa;
    this.Logo = brand.Logo;
    this.Website = brand.Website;
    this.ThuTu = brand.ThuTu || 0;
    this.TrangThai = brand.TrangThai || 1;
    // SEO fields
    this.SEO_URL = brand.SEO_URL || this.generateSlug();
    this.SEO_TuKhoa = brand.SEO_TuKhoa;
    this.SEO_MoTa = brand.SEO_MoTa;
    this.SEO_TieuDe = brand.SEO_TieuDe;
  }

  generateSlug() {
    return slugify(this.Ten, {
      lower: true,
      strict: true,
      locale: "vi",
    });
  }

  async save() {
    const [result] = await db.execute(
      `INSERT INTO thuonghieu 
       (Ten, MoTa, Logo, Website, ThuTu, TrangThai, SEO_URL, SEO_TuKhoa, SEO_MoTa, SEO_TieuDe) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        this.Ten,
        this.MoTa,
        this.Logo,
        this.Website,
        this.ThuTu,
        this.TrangThai,
        this.SEO_URL,
        this.SEO_TuKhoa,
        this.SEO_MoTa,
        this.SEO_TieuDe,
      ]
    );
    return result.insertId;
  }

  async update() {
    if (!this.SEO_URL) {
      this.SEO_URL = this.generateSlug();
    }

    await db.execute(
      `UPDATE thuonghieu 
       SET Ten = ?, MoTa = ?, Logo = ?, Website = ?, ThuTu = ?, TrangThai = ?, 
           SEO_URL = ?, SEO_TuKhoa = ?, SEO_MoTa = ?, SEO_TieuDe = ?
       WHERE id = ?`,
      [
        this.Ten,
        this.MoTa,
        this.Logo,
        this.Website,
        this.ThuTu,
        this.TrangThai,
        this.SEO_URL,
        this.SEO_TuKhoa,
        this.SEO_MoTa,
        this.SEO_TieuDe,
        this.id,
      ]
    );
  }

  static async getAll() {
    const [rows] = await db.execute(
      "SELECT * FROM thuonghieu WHERE TrangThai = 1 ORDER BY ThuTu ASC, Ten ASC"
    );
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute(
      "SELECT * FROM thuonghieu WHERE id = ? AND TrangThai = 1",
      [id]
    );
    return rows[0];
  }

  static async getBySlug(slug) {
    const [rows] = await db.execute(
      "SELECT * FROM thuonghieu WHERE SEO_URL = ? AND TrangThai = 1",
      [slug]
    );
    return rows[0];
  }

  static async updateOrder(brands) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      for (const brand of brands) {
        await conn.execute("UPDATE thuonghieu SET ThuTu = ? WHERE id = ?", [
          brand.ThuTu,
          brand.id,
        ]);
      }

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async delete(id) {
    // Check if brand has associated products
    const [products] = await db.execute(
      "SELECT COUNT(*) as count FROM sanpham WHERE id_ThuongHieu = ?",
      [id]
    );

    if (products[0].count > 0) {
      throw new Error("Không thể xóa thương hiệu đang có sản phẩm");
    }

    await db.execute("UPDATE thuonghieu SET TrangThai = 0 WHERE id = ?", [id]);
  }

  static async checkSlugExists(slug, excludeId = null) {
    let query = "SELECT COUNT(*) as count FROM thuonghieu WHERE SEO_URL = ?";
    const values = [slug];

    if (excludeId) {
      query += " AND id != ?";
      values.push(excludeId);
    }

    const [rows] = await db.execute(query, values);
    return rows[0].count > 0;
  }

  static async generateUniqueSlug(name, id = null) {
    let slug = slugify(name, {
      lower: true,
      strict: true,
      locale: "vi",
    });

    let counter = 1;
    let uniqueSlug = slug;

    while (await this.checkSlugExists(uniqueSlug, id)) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }

  static async getStats(brandId) {
    const [rows] = await db.execute(
      `SELECT 
        COUNT(DISTINCT sp.id) as TongSanPham,
        COUNT(DISTINCT dh.id) as TongDonHang,
        SUM(ctdh.ThanhTien) as TongDoanhThu
       FROM thuonghieu th
       LEFT JOIN sanpham sp ON th.id = sp.id_ThuongHieu
       LEFT JOIN sanpham_bien_the spbt ON sp.id = spbt.id_SanPham
       LEFT JOIN chitietdonhang ctdh ON spbt.id = ctdh.id_SanPham_BienThe
       LEFT JOIN donhang dh ON ctdh.id_DonHang = dh.id AND dh.TrangThai = 4
       WHERE th.id = ?
       GROUP BY th.id`,
      [brandId]
    );
    return (
      rows[0] || {
        TongSanPham: 0,
        TongDonHang: 0,
        TongDoanhThu: 0,
      }
    );
  }
}

module.exports = Brand;
