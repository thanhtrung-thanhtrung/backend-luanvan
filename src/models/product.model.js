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
    let query = `
      SELECT DISTINCT sp.*, 
        dm.Ten as TenDanhMuc,
        th.Ten as TenThuongHieu,
        GROUP_CONCAT(DISTINCT ms.Ten) as MauSac,
        GROUP_CONCAT(DISTINCT kc.Ten) as KichCo,
        MIN(spbt.SoLuong > 0) as ConHang
      FROM sanpham sp
      LEFT JOIN danhmuc dm ON sp.id_DanhMuc = dm.id
      LEFT JOIN thuonghieu th ON sp.id_ThuongHieu = th.id
      LEFT JOIN sanpham_bien_the spbt ON sp.id = spbt.id_SanPham
      LEFT JOIN mausac ms ON spbt.id_MauSac = ms.id
      LEFT JOIN kichco kc ON spbt.id_KichCo = kc.id
      WHERE sp.TrangThai = 1
    `;
    const values = [];

    if (filters.categoryId) {
      query += " AND sp.id_DanhMuc = ?";
      values.push(filters.categoryId);
    }

    if (filters.brandId) {
      query += " AND sp.id_ThuongHieu = ?";
      values.push(filters.brandId);
    }

    if (filters.priceMin !== undefined) {
      query +=
        " AND (sp.GiaKhuyenMai > 0 AND sp.GiaKhuyenMai >= ? OR sp.Gia >= ?)";
      values.push(filters.priceMin, filters.priceMin);
    }

    if (filters.priceMax !== undefined) {
      query +=
        " AND (sp.GiaKhuyenMai > 0 AND sp.GiaKhuyenMai <= ? OR sp.Gia <= ?)";
      values.push(filters.priceMax, filters.priceMax);
    }

    if (filters.colors && filters.colors.length > 0) {
      query += " AND ms.id IN (?)";
      values.push(filters.colors);
    }

    if (filters.sizes && filters.sizes.length > 0) {
      query += " AND kc.id IN (?)";
      values.push(filters.sizes);
    }

    if (filters.inStock === true) {
      query += " AND spbt.SoLuong > 0";
    }

    if (filters.search) {
      query +=
        " AND (sp.Ten LIKE ? OR sp.MoTa LIKE ? OR th.Ten LIKE ? OR dm.Ten LIKE ?)";
      const searchPattern = `%${filters.search}%`;
      values.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Sorting
    query += " GROUP BY sp.id";
    switch (filters.sort) {
      case "price_asc":
        query += " ORDER BY COALESCE(sp.GiaKhuyenMai, sp.Gia) ASC";
        break;
      case "price_desc":
        query += " ORDER BY COALESCE(sp.GiaKhuyenMai, sp.Gia) DESC";
        break;
      case "newest":
        query += " ORDER BY sp.NgayTao DESC";
        break;
      case "popular":
        query += " ORDER BY sp.LuotXem DESC";
        break;
      default:
        query += " ORDER BY sp.NgayTao DESC";
    }

    // Pagination
    if (filters.page && filters.limit) {
      const offset = (filters.page - 1) * filters.limit;
      query += " LIMIT ? OFFSET ?";
      values.push(filters.limit, offset);
    }

    const [rows] = await db.execute(query, values);

    // Format the results
    return rows.map((product) => ({
      ...product,
      MauSac: product.MauSac ? product.MauSac.split(",") : [],
      KichCo: product.KichCo ? product.KichCo.split(",") : [],
      ConHang: Boolean(product.ConHang),
    }));
  }

  static async getCount(filters = {}) {
    let query = `
      SELECT COUNT(DISTINCT sp.id) as total
      FROM sanpham sp
      LEFT JOIN danhmuc dm ON sp.id_DanhMuc = dm.id
      LEFT JOIN thuonghieu th ON sp.id_ThuongHieu = th.id
      LEFT JOIN sanpham_bien_the spbt ON sp.id = spbt.id_SanPham
      LEFT JOIN mausac ms ON spbt.id_MauSac = ms.id
      LEFT JOIN kichco kc ON spbt.id_KichCo = kc.id
      WHERE sp.TrangThai = 1
    `;
    const values = [];

    if (filters.categoryId) {
      query += " AND sp.id_DanhMuc = ?";
      values.push(filters.categoryId);
    }

    if (filters.brandId) {
      query += " AND sp.id_ThuongHieu = ?";
      values.push(filters.brandId);
    }

    if (filters.priceMin !== undefined) {
      query +=
        " AND (sp.GiaKhuyenMai > 0 AND sp.GiaKhuyenMai >= ? OR sp.Gia >= ?)";
      values.push(filters.priceMin, filters.priceMin);
    }

    if (filters.priceMax !== undefined) {
      query +=
        " AND (sp.GiaKhuyenMai > 0 AND sp.GiaKhuyenMai <= ? OR sp.Gia <= ?)";
      values.push(filters.priceMax, filters.priceMax);
    }

    if (filters.colors && filters.colors.length > 0) {
      query += " AND ms.id IN (?)";
      values.push(filters.colors);
    }

    if (filters.sizes && filters.sizes.length > 0) {
      query += " AND kc.id IN (?)";
      values.push(filters.sizes);
    }

    if (filters.inStock === true) {
      query += " AND spbt.SoLuong > 0";
    }

    if (filters.search) {
      query +=
        " AND (sp.Ten LIKE ? OR sp.MoTa LIKE ? OR th.Ten LIKE ? OR dm.Ten LIKE ?)";
      const searchPattern = `%${filters.search}%`;
      values.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const [rows] = await db.execute(query, values);
    return rows[0].total;
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
      `SELECT spbt.*, kc.Ten as TenKichCo, ms.Ten as TenMauSac, ms.MaMau
       FROM sanpham_bien_the spbt
       JOIN kichco kc ON spbt.id_KichCo = kc.id
       JOIN mausac ms ON spbt.id_MauSac = ms.id
       WHERE spbt.id_SanPham = ?`,
      [productId]
    );
    return rows;
  }

  async addVariant(variantData) {
    const [existing] = await db.execute(
      `SELECT id FROM sanpham_bien_the 
       WHERE id_SanPham = ? AND id_MauSac = ? AND id_KichCo = ?`,
      [this.id, variantData.id_MauSac, variantData.id_KichCo]
    );

    if (existing.length > 0) {
      throw new Error("Biến thể này đã tồn tại");
    }

    const [result] = await db.execute(
      `INSERT INTO sanpham_bien_the 
       (id_SanPham, id_MauSac, id_KichCo, SoLuong) 
       VALUES (?, ?, ?, ?)`,
      [
        this.id,
        variantData.id_MauSac,
        variantData.id_KichCo,
        variantData.SoLuong || 0,
      ]
    );

    return result.insertId;
  }

  static async createVariant(variant) {
    const [result] = await db.execute(
      `INSERT INTO sanpham_bien_the 
       (id_SanPham, id_KichCo, id_MauSac, SoLuong, SKU) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        variant.id_SanPham,
        variant.id_KichCo,
        variant.id_MauSac,
        variant.SoLuong || 0,
        variant.SKU,
      ]
    );
    return result.insertId;
  }

  static async updateVariant(id, variant) {
    await db.execute(
      `UPDATE sanpham_bien_the 
       SET id_KichCo = ?, id_MauSac = ?, SoLuong = ?, SKU = ?
       WHERE id = ?`,
      [variant.id_KichCo, variant.id_MauSac, variant.SoLuong, variant.SKU, id]
    );
  }

  async updateVariant(variantId, data) {
    // Validate variant belongs to this product
    const [variant] = await db.execute(
      "SELECT * FROM sanpham_bien_the WHERE id = ? AND id_SanPham = ?",
      [variantId, this.id]
    );

    if (variant.length === 0) {
      throw new Error(
        "Biến thể không tồn tại hoặc không thuộc về sản phẩm này"
      );
    }

    await db.execute(
      "UPDATE sanpham_bien_the SET id_MauSac = ?, id_KichCo = ?, SoLuong = ? WHERE id = ?",
      [data.id_MauSac, data.id_KichCo, data.SoLuong, variantId]
    );
  }

  static async deleteVariant(id) {
    // Check if variant has any orders
    const [orders] = await db.execute(
      "SELECT COUNT(*) as count FROM chitietdonhang WHERE id_SanPham_BienThe = ?",
      [id]
    );

    if (orders[0].count > 0) {
      throw new Error("Không thể xóa biến thể đã có đơn hàng");
    }

    await db.execute("DELETE FROM sanpham_bien_the WHERE id = ?", [id]);
  }

  async deleteVariant(variantId) {
    // Check if variant is used in any orders
    const [orders] = await db.execute(
      "SELECT COUNT(*) as count FROM chitietdonhang WHERE id_SanPham_BienThe = ?",
      [variantId]
    );

    if (orders[0].count > 0) {
      throw new Error("Không thể xóa biến thể đã được đặt hàng");
    }

    // Check if variant belongs to this product
    const [variant] = await db.execute(
      "SELECT * FROM sanpham_bien_the WHERE id = ? AND id_SanPham = ?",
      [variantId, this.id]
    );

    if (variant.length === 0) {
      throw new Error(
        "Biến thể không tồn tại hoặc không thuộc về sản phẩm này"
      );
    }

    await db.execute("DELETE FROM sanpham_bien_the WHERE id = ?", [variantId]);
  }

  static async updateImages(productId, images) {
    await db.execute("UPDATE sanpham SET HinhAnh = ? WHERE id = ?", [
      JSON.stringify(images),
      productId,
    ]);
  }

  static async deleteImage(productId, imageUrl) {
    const [rows] = await db.execute(
      "SELECT HinhAnh FROM sanpham WHERE id = ?",
      [productId]
    );

    if (rows[0] && rows[0].HinhAnh) {
      const images = JSON.parse(rows[0].HinhAnh);

      if (images.anhChinh === imageUrl) {
        throw new Error("Không thể xóa ảnh chính của sản phẩm");
      }

      images.anhPhu = images.anhPhu.filter((url) => url !== imageUrl);

      await this.updateImages(productId, images);
    }
  }

  static async setMainImage(productId, imageUrl) {
    const [rows] = await db.execute(
      "SELECT HinhAnh FROM sanpham WHERE id = ?",
      [productId]
    );

    if (rows[0] && rows[0].HinhAnh) {
      const images = JSON.parse(rows[0].HinhAnh);

      // If current main image exists, move it to anhPhu
      if (images.anhChinh) {
        images.anhPhu = [
          images.anhChinh,
          ...images.anhPhu.filter((url) => url !== imageUrl),
        ];
      }

      images.anhChinh = imageUrl;

      await this.updateImages(productId, images);
    }
  }

  static async generateSKU(productId, sizeId, colorId) {
    const [product] = await db.execute(
      `SELECT sp.Ten as TenSP, th.Ten as TenTH 
       FROM sanpham sp 
       JOIN thuonghieu th ON sp.id_ThuongHieu = th.id 
       WHERE sp.id = ?`,
      [productId]
    );

    const [size] = await db.execute("SELECT Ten FROM kichco WHERE id = ?", [
      sizeId,
    ]);

    const [color] = await db.execute("SELECT Ten FROM mausac WHERE id = ?", [
      colorId,
    ]);

    if (!product[0] || !size[0] || !color[0]) {
      throw new Error("Dữ liệu không hợp lệ");
    }

    const brandPrefix = product[0].TenTH.substring(0, 2).toUpperCase();
    const productPrefix = product[0].TenSP.substring(0, 3).toUpperCase();
    const sizeCode = size[0].Ten;
    const colorCode = color[0].Ten.substring(0, 3).toUpperCase();

    const sku = `${brandPrefix}-${productPrefix}-${sizeCode}-${colorCode}`;

    // Check if SKU exists
    const [existing] = await db.execute(
      "SELECT COUNT(*) as count FROM sanpham_bien_the WHERE SKU = ?",
      [sku]
    );

    if (existing[0].count > 0) {
      throw new Error("SKU đã tồn tại");
    }

    return sku;
  }

  // Get available colors for a specific size
  static async getAvailableColors(productId, sizeId) {
    const [rows] = await db.execute(
      `SELECT DISTINCT ms.* 
       FROM sanpham_bien_the spbt
       JOIN mausac ms ON spbt.id_MauSac = ms.id
       WHERE spbt.id_SanPham = ? AND spbt.id_KichCo = ? AND spbt.SoLuong > 0`,
      [productId, sizeId]
    );
    return rows;
  }

  // Get available sizes for a specific color
  static async getAvailableSizes(productId, colorId) {
    const [rows] = await db.execute(
      `SELECT DISTINCT kc.* 
       FROM sanpham_bien_the spbt
       JOIN kichco kc ON spbt.id_KichCo = kc.id
       WHERE spbt.id_SanPham = ? AND spbt.id_MauSac = ? AND spbt.SoLuong > 0`,
      [productId, colorId]
    );
    return rows;
  }

  static async getRelatedProducts(productId, limit = 8) {
    const [product] = await db.execute(
      "SELECT id_DanhMuc, id_ThuongHieu FROM sanpham WHERE id = ?",
      [productId]
    );

    if (!product) return [];

    const query = `
      SELECT DISTINCT sp.*, 
        dm.Ten as TenDanhMuc,
        th.Ten as TenThuongHieu,
        GROUP_CONCAT(DISTINCT ms.Ten) as MauSac,
        GROUP_CONCAT(DISTINCT kc.Ten) as KichCo
      FROM sanpham sp
      LEFT JOIN danhmuc dm ON sp.id_DanhMuc = dm.id
      LEFT JOIN thuonghieu th ON sp.id_ThuongHieu = th.id
      LEFT JOIN sanpham_bien_the spbt ON sp.id = spbt.id_SanPham
      LEFT JOIN mausac ms ON spbt.id_MauSac = ms.id
      LEFT JOIN kichco kc ON spbt.id_KichCo = kc.id
      WHERE sp.TrangThai = 1 
      AND sp.id != ?
      AND (sp.id_DanhMuc = ? OR sp.id_ThuongHieu = ?)
      GROUP BY sp.id
      ORDER BY RAND()
      LIMIT ?
    `;

    const [rows] = await db.execute(query, [
      productId,
      product.id_DanhMuc,
      product.id_ThuongHieu,
      limit,
    ]);

    return rows.map((product) => ({
      ...product,
      MauSac: product.MauSac ? product.MauSac.split(",") : [],
      KichCo: product.KichCo ? product.KichCo.split(",") : [],
    }));
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
