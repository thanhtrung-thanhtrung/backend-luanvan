const db = require("../config/database");

class Cart {
  constructor(oldCart) {
    this.items = oldCart?.items || {};
    this.totalQty = oldCart?.totalQty || 0;
    this.totalPrice = oldCart?.totalPrice || 0;
  }

  async add(product, variantId, quantity = 1) {
    const variant = await this.getVariantDetails(variantId);
    if (!variant) {
      throw new Error("Biến thể sản phẩm không tồn tại");
    }

    if (variant.SoLuong < quantity) {
      throw new Error("Số lượng sản phẩm trong kho không đủ");
    }

    let storedItem = this.items[variantId];

    if (!storedItem) {
      storedItem = this.items[variantId] = {
        item: {
          id: product.id,
          Ten: product.Ten,
          Gia: product.Gia,
          GiaKhuyenMai: product.GiaKhuyenMai,
          HinhAnh: product.HinhAnh,
          variant: {
            id: variant.id,
            TenMauSac: variant.TenMauSac,
            TenKichCo: variant.TenKichCo,
          },
        },
        qty: 0,
        price: 0,
      };
    }

    storedItem.qty += quantity;
    if (storedItem.qty > variant.SoLuong) {
      throw new Error("Số lượng sản phẩm trong kho không đủ");
    }

    const itemPrice = product.GiaKhuyenMai || product.Gia;
    storedItem.price = storedItem.qty * itemPrice;
    this.totalQty += quantity;
    this.totalPrice += itemPrice * quantity;
  }

  async getVariantDetails(variantId) {
    const [rows] = await db.execute(
      `SELECT spbt.*, ms.Ten as TenMauSac, kc.Ten as TenKichCo
             FROM sanpham_bien_the spbt
             JOIN mausac ms ON spbt.id_MauSac = ms.id
             JOIN kichco kc ON spbt.id_KichCo = kc.id
             WHERE spbt.id = ?`,
      [variantId]
    );
    return rows[0];
  }

  reduceByOne(variantId) {
    if (!this.items[variantId]) {
      throw new Error("Sản phẩm không có trong giỏ hàng");
    }

    this.items[variantId].qty--;
    const itemPrice =
      this.items[variantId].item.GiaKhuyenMai || this.items[variantId].item.Gia;
    this.items[variantId].price -= itemPrice;
    this.totalQty--;
    this.totalPrice -= itemPrice;

    if (this.items[variantId].qty <= 0) {
      delete this.items[variantId];
    }
  }

  updateQuantity(variantId, quantity) {
    const item = this.items[variantId];
    if (!item) {
      throw new Error("Sản phẩm không có trong giỏ hàng");
    }

    const difference = quantity - item.qty;
    const itemPrice = item.item.GiaKhuyenMai || item.item.Gia;

    item.qty = quantity;
    item.price = quantity * itemPrice;
    this.totalQty += difference;
    this.totalPrice += difference * itemPrice;

    if (item.qty <= 0) {
      delete this.items[variantId];
    }
  }

  removeItem(variantId) {
    if (!this.items[variantId]) {
      throw new Error("Sản phẩm không có trong giỏ hàng");
    }

    this.totalQty -= this.items[variantId].qty;
    this.totalPrice -= this.items[variantId].price;
    delete this.items[variantId];
  }

  clear() {
    this.items = {};
    this.totalQty = 0;
    this.totalPrice = 0;
  }

  generateArray() {
    return Object.values(this.items);
  }

  // Lưu giỏ hàng vào database cho user đã đăng nhập
  async save(userId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Xóa giỏ hàng cũ
      await connection.execute("DELETE FROM giohang WHERE id_NguoiDung = ?", [
        userId,
      ]);

      // Thêm các item mới
      for (const [variantId, item] of Object.entries(this.items)) {
        await connection.execute(
          `INSERT INTO giohang (
                        id_NguoiDung, id_SanPham_BienThe,
                        SoLuong, DonGia
                    ) VALUES (?, ?, ?, ?)`,
          [userId, variantId, item.qty, item.item.GiaKhuyenMai || item.item.Gia]
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Lấy giỏ hàng từ database cho user đã đăng nhập
  static async loadFromDatabase(userId) {
    const [rows] = await db.execute(
      `SELECT gh.*, sp.Ten, sp.Gia, sp.GiaKhuyenMai, sp.HinhAnh,
                    ms.Ten as TenMauSac, kc.Ten as TenKichCo
             FROM giohang gh
             JOIN sanpham_bien_the spbt ON gh.id_SanPham_BienThe = spbt.id
             JOIN sanpham sp ON spbt.id_SanPham = sp.id
             JOIN mausac ms ON spbt.id_MauSac = ms.id
             JOIN kichco kc ON spbt.id_KichCo = kc.id
             WHERE gh.id_NguoiDung = ?`,
      [userId]
    );

    const cart = new Cart();
    for (const row of rows) {
      cart.items[row.id_SanPham_BienThe] = {
        item: {
          id: row.id_SanPham,
          Ten: row.Ten,
          Gia: row.Gia,
          GiaKhuyenMai: row.GiaKhuyenMai,
          HinhAnh: row.HinhAnh,
          variant: {
            id: row.id_SanPham_BienThe,
            TenMauSac: row.TenMauSac,
            TenKichCo: row.TenKichCo,
          },
        },
        qty: row.SoLuong,
        price: row.SoLuong * (row.GiaKhuyenMai || row.Gia),
      };
      cart.totalQty += row.SoLuong;
      cart.totalPrice += row.SoLuong * (row.GiaKhuyenMai || row.Gia);
    }

    return cart;
  }
}

module.exports = Cart;
