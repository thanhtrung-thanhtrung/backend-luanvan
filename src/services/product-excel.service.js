const ExcelJS = require("exceljs");
const Product = require("../models/product.model");
const { AppError } = require("../middlewares/error.middleware");

class ProductExcelService {
  static async exportProducts(filters = {}) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sản phẩm");

    // Define columns
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Tên sản phẩm", key: "Ten", width: 30 },
      { header: "Danh mục", key: "TenDanhMuc", width: 20 },
      { header: "Thương hiệu", key: "TenThuongHieu", width: 20 },
      { header: "Giá", key: "Gia", width: 15 },
      { header: "Giá khuyến mãi", key: "GiaKhuyenMai", width: 15 },
      { header: "Trạng thái", key: "TrangThai", width: 15 },
      { header: "Các biến thể", key: "BienThe", width: 40 },
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Get products data
    const products = await Product.getAll(filters);

    // Add products to worksheet
    for (const product of products) {
      const variants = await Product.getVariants(product.id);
      const variantStr = variants
        .map((v) => `${v.TenMauSac}-${v.TenKichCo}:${v.SoLuong}`)
        .join(", ");

      worksheet.addRow({
        id: product.id,
        Ten: product.Ten,
        TenDanhMuc: product.TenDanhMuc,
        TenThuongHieu: product.TenThuongHieu,
        Gia: product.Gia,
        GiaKhuyenMai: product.GiaKhuyenMai || "",
        TrangThai: product.TrangThai === 1 ? "Đang bán" : "Ngừng bán",
        BienThe: variantStr,
      });
    }

    // Format number columns
    worksheet.getColumn("Gia").numFmt = "#,##0";
    worksheet.getColumn("GiaKhuyenMai").numFmt = "#,##0";

    // Add borders
    worksheet.eachRow({ includeEmpty: true }, (row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    return workbook;
  }

  static async importProducts(file) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);
    const worksheet = workbook.getWorksheet(1);

    const results = {
      success: 0,
      errors: [],
      total: 0,
    };

    // Skip header row
    const rows = worksheet.getRows(2, worksheet.rowCount - 1);

    for (const row of rows) {
      try {
        results.total++;

        // Basic validation
        if (!row.getCell("Ten").value) {
          throw new Error("Tên sản phẩm không được để trống");
        }

        if (!row.getCell("Gia").value || isNaN(row.getCell("Gia").value)) {
          throw new Error("Giá không hợp lệ");
        }

        // Create product object
        const productData = {
          Ten: row.getCell("Ten").value,
          MoTa: row.getCell("MoTa")?.value || "",
          Gia: parseFloat(row.getCell("Gia").value),
          GiaKhuyenMai: row.getCell("GiaKhuyenMai")?.value || null,
          id_DanhMuc: row.getCell("id_DanhMuc")?.value,
          id_ThuongHieu: row.getCell("id_ThuongHieu")?.value,
          TrangThai: 1,
        };

        // Create product
        const product = new Product(productData);
        const productId = await product.save();

        // Handle variants if provided
        const variantsStr = row.getCell("BienThe")?.value;
        if (variantsStr) {
          const variants = variantsStr.split(",").map((v) => v.trim());
          for (const variant of variants) {
            const [color, size, quantity] = variant.split("-");
            if (color && size && quantity) {
              await Product.createVariant({
                id_SanPham: productId,
                id_MauSac: parseInt(color),
                id_KichCo: parseInt(size),
                SoLuong: parseInt(quantity),
              });
            }
          }
        }

        results.success++;
      } catch (error) {
        results.errors.push({
          row: row.number,
          error: error.message,
        });
      }
    }

    return results;
  }

  static async getImportTemplate() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Template");

    // Define columns
    worksheet.columns = [
      { header: "Tên sản phẩm (*)", key: "Ten", width: 30 },
      { header: "Mô tả", key: "MoTa", width: 40 },
      { header: "Giá (*)", key: "Gia", width: 15 },
      { header: "Giá khuyến mãi", key: "GiaKhuyenMai", width: 15 },
      { header: "ID Danh mục (*)", key: "id_DanhMuc", width: 15 },
      { header: "ID Thương hiệu (*)", key: "id_ThuongHieu", width: 15 },
      { header: "Biến thể (Màu-Size-SL)", key: "BienThe", width: 30 },
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Add example row
    worksheet.addRow({
      Ten: "Giày thể thao ABC",
      MoTa: "Mô tả sản phẩm",
      Gia: 1000000,
      GiaKhuyenMai: 900000,
      id_DanhMuc: 1,
      id_ThuongHieu: 1,
      BienThe: "1-1-10, 1-2-15, 2-1-20",
    });

    // Add note
    worksheet.addRow([]);
    worksheet.addRow(["Ghi chú:"]);
    worksheet.addRow(["(*) là trường bắt buộc"]);
    worksheet.addRow([
      "Biến thể: ID_Màu-ID_Size-Số_lượng, phân cách bằng dấu phẩy",
    ]);

    return workbook;
  }
}

module.exports = ProductExcelService;
