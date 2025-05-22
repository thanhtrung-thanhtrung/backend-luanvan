const db = require("../config/database");
const slugify = require("slugify");

class Category {
  constructor(category) {
    this.id = category.id;
    this.Ten = category.Ten;
    this.MoTa = category.MoTa;
    this.HinhAnh = category.HinhAnh;
    this.ThuTu = category.ThuTu || 0;
    this.TrangThai = category.TrangThai || 1;
    // SEO fields
    this.SEO_URL = category.SEO_URL || this.generateSlug();
    this.SEO_TuKhoa = category.SEO_TuKhoa;
    this.SEO_MoTa = category.SEO_MoTa;
    this.SEO_TieuDe = category.SEO_TieuDe;
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
      `INSERT INTO danhmuc 
       (Ten, MoTa, HinhAnh, ThuTu, TrangThai, SEO_URL, SEO_TuKhoa, SEO_MoTa, SEO_TieuDe) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        this.Ten,
        this.MoTa,
        this.HinhAnh,
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
      `UPDATE danhmuc 
       SET Ten = ?, MoTa = ?, HinhAnh = ?, ThuTu = ?, TrangThai = ?, 
           SEO_URL = ?, SEO_TuKhoa = ?, SEO_MoTa = ?, SEO_TieuDe = ?
       WHERE id = ?`,
      [
        this.Ten,
        this.MoTa,
        this.HinhAnh,
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
      "SELECT * FROM danhmuc WHERE TrangThai = 1 ORDER BY ThuTu ASC, Ten ASC"
    );
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute(
      "SELECT * FROM danhmuc WHERE id = ? AND TrangThai = 1",
      [id]
    );
    return rows[0];
  }

  static async getBySlug(slug) {
    const [rows] = await db.execute(
      "SELECT * FROM danhmuc WHERE SEO_URL = ? AND TrangThai = 1",
      [slug]
    );
    return rows[0];
  }

  static async updateOrder(categories) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      for (const cat of categories) {
        await conn.execute("UPDATE danhmuc SET ThuTu = ? WHERE id = ?", [
          cat.ThuTu,
          cat.id,
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
    await db.execute("UPDATE danhmuc SET TrangThai = 0 WHERE id = ?", [id]);
  }

  static async checkSlugExists(slug, excludeId = null) {
    let query = "SELECT COUNT(*) as count FROM danhmuc WHERE SEO_URL = ?";
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
}

module.exports = Category;
