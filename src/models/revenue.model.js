const db = require("../config/database");

class Revenue {
  static async getRevenueStats(filters = {}) {
    let query = `
      SELECT 
        DATE(dh.NgayTao) as Ngay,
        COUNT(DISTINCT dh.id) as SoDonHang,
        SUM(dh.TongTien) as DoanhThu,
        SUM(dh.TienGiam) as TongGiamGia,
        SUM(dh.PhiVanChuyen) as TongPhiVanChuyen
      FROM donhang dh
      WHERE dh.TrangThai = 4
    `;
    const values = [];

    if (filters.startDate) {
      query += " AND dh.NgayTao >= ?";
      values.push(filters.startDate);
    }

    if (filters.endDate) {
      query += " AND dh.NgayTao <= ?";
      values.push(filters.endDate);
    }

    query += " GROUP BY DATE(dh.NgayTao)";
    query += " ORDER BY Ngay DESC";

    const [rows] = await db.execute(query, values);
    return rows;
  }

  static async getProductPerformance(filters = {}) {
    let query = `
      SELECT 
        sp.id,
        sp.Ten as TenSanPham,
        COUNT(DISTINCT dh.id) as SoDonHang,
        SUM(ctdh.SoLuong) as SoLuongBan,
        SUM(ctdh.ThanhTien) as DoanhThu,
        AVG(ctdh.DonGia) as GiaTrungBinh,
        COUNT(DISTINCT dg.id) as SoDanhGia,
        AVG(dg.SoSao) as DiemDanhGia
      FROM sanpham sp
      JOIN sanpham_bien_the spbt ON sp.id = spbt.id_SanPham
      JOIN chitietdonhang ctdh ON spbt.id = ctdh.id_SanPham_BienThe
      JOIN donhang dh ON ctdh.id_DonHang = dh.id
      LEFT JOIN danhgia dg ON sp.id = dg.id_SanPham
      WHERE dh.TrangThai = 4
    `;
    const values = [];

    if (filters.startDate) {
      query += " AND dh.NgayTao >= ?";
      values.push(filters.startDate);
    }

    if (filters.endDate) {
      query += " AND dh.NgayTao <= ?";
      values.push(filters.endDate);
    }

    if (filters.categoryId) {
      query += " AND sp.id_DanhMuc = ?";
      values.push(filters.categoryId);
    }

    query += ` 
      GROUP BY sp.id
      ORDER BY ${filters.sortBy || "DoanhThu"} DESC
      LIMIT ?
    `;
    values.push(parseInt(filters.limit || 10));

    const [rows] = await db.execute(query, values);
    return rows;
  }

  static async getCategoryPerformance(filters = {}) {
    let query = `
      SELECT 
        dm.id,
        dm.Ten as TenDanhMuc,
        COUNT(DISTINCT dh.id) as SoDonHang,
        COUNT(DISTINCT sp.id) as SoSanPham,
        SUM(ctdh.SoLuong) as SoLuongBan,
        SUM(ctdh.ThanhTien) as DoanhThu
      FROM danhmuc dm
      JOIN sanpham sp ON dm.id = sp.id_DanhMuc
      JOIN sanpham_bien_the spbt ON sp.id = spbt.id_SanPham
      JOIN chitietdonhang ctdh ON spbt.id = ctdh.id_SanPham_BienThe
      JOIN donhang dh ON ctdh.id_DonHang = dh.id
      WHERE dh.TrangThai = 4
    `;
    const values = [];

    if (filters.startDate) {
      query += " AND dh.NgayTao >= ?";
      values.push(filters.startDate);
    }

    if (filters.endDate) {
      query += " AND dh.NgayTao <= ?";
      values.push(filters.endDate);
    }

    query += `
      GROUP BY dm.id
      ORDER BY DoanhThu DESC
    `;

    const [rows] = await db.execute(query, values);
    return rows;
  }

  static async getCustomerAnalytics(filters = {}) {
    let query = `
      SELECT 
        nd.id,
        nd.HoTen,
        nd.Email,
        COUNT(DISTINCT dh.id) as SoDonHang,
        SUM(dh.TongTien) as TongChiTieu,
        AVG(dh.TongTien) as GiaTriTrungBinh,
        MAX(dh.NgayTao) as LanMuaCuoi
      FROM nguoidung nd
      JOIN donhang dh ON nd.id = dh.id_NguoiDung
      WHERE dh.TrangThai = 4
    `;
    const values = [];

    if (filters.startDate) {
      query += " AND dh.NgayTao >= ?";
      values.push(filters.startDate);
    }

    if (filters.endDate) {
      query += " AND dh.NgayTao <= ?";
      values.push(filters.endDate);
    }

    query += `
      GROUP BY nd.id
      ORDER BY TongChiTieu DESC
      LIMIT ?
    `;
    values.push(parseInt(filters.limit || 10));

    const [rows] = await db.execute(query, values);
    return rows;
  }

  static async getTrendAnalysis(period = "day") {
    let groupBy, interval;
    switch (period) {
      case "week":
        groupBy = "YEARWEEK(dh.NgayTao, 1)";
        interval = "DATE_FORMAT(dh.NgayTao, '%Y-W%u')";
        break;
      case "month":
        groupBy = 'DATE_FORMAT(dh.NgayTao, "%Y-%m")';
        interval = groupBy;
        break;
      default: // day
        groupBy = "DATE(dh.NgayTao)";
        interval = groupBy;
    }

    const query = `
      SELECT 
        ${interval} as ThoiGian,
        COUNT(DISTINCT dh.id) as SoDonHang,
        SUM(dh.TongTien) as DoanhThu,
        COUNT(DISTINCT dh.id_NguoiDung) as SoKhachHang,
        AVG(dh.TongTien) as GiaTriTrungBinh
      FROM donhang dh
      WHERE dh.TrangThai = 4
        AND dh.NgayTao >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY ${groupBy}
      ORDER BY ThoiGian DESC
    `;

    const [rows] = await db.execute(query);
    return rows;
  }
}

module.exports = Revenue;
