const db = require("../config/database");

class User {
  static async create(userData) {
    const [result] = await db.execute(
      `INSERT INTO nguoidung (
                HoTen, Email, MatKhau, SDT, DiaChi, Avatar
            ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userData.HoTen,
        userData.Email,
        userData.MatKhau,
        userData.SDT || null,
        userData.DiaChi || null,
        userData.Avatar || null,
      ]
    );
    return result.insertId;
  }

  static async getById(id) {
    const [rows] = await db.execute(
      "SELECT id, HoTen, Email, SDT, DiaChi, Avatar, NgayTao, TrangThai FROM nguoidung WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  static async getByEmail(email) {
    if (!email || typeof email !== "string") {
      return null;
    }
    const [rows] = await db.execute(
      "SELECT * FROM nguoidung WHERE Email = ? AND TrangThai = 1",
      [email]
    );
    return rows[0] || null;
  }

  static async getByResetToken(token) {
    const [rows] = await db.execute(
      "SELECT * FROM nguoidung WHERE reset_token = ?",
      [token]
    );
    return rows[0];
  }

  static async update(id, updateData) {
    const allowedFields = [
      "HoTen",
      "SDT",
      "DiaChi",
      "Avatar",
      "MatKhau",
      "reset_token",
      "reset_token_expiry",
      "TrangThai",
    ];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) return;

    values.push(id);
    await db.execute(
      `UPDATE nguoidung SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
  }

  static async delete(id) {
    const [result] = await db.execute(
      "UPDATE nguoidung SET TrangThai = 0 WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getAll({ page = 1, limit = 10, search = "" }) {
    const offset = (page - 1) * limit;
    let query =
      "SELECT id, HoTen, Email, SDT, DiaChi, Avatar, NgayTao, TrangThai FROM nguoidung WHERE 1=1";
    const queryParams = [];

    if (search) {
      query += " AND (HoTen LIKE ? OR Email LIKE ? OR SDT LIKE ?)";
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    // Get total count
    const [countRows] = await db.execute(
      `SELECT COUNT(*) as total FROM (${query}) as counted`,
      queryParams
    );
    const total = countRows[0].total;

    // Get paginated results
    query += " ORDER BY NgayTao DESC LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);

    const [rows] = await db.execute(query, queryParams);

    return {
      users: rows,
      total: total,
    };
  }

  static async getUserRoles(userId) {
    const [rows] = await db.execute(
      `SELECT q.* 
             FROM quyen q
             JOIN quyenguoidung qg ON q.id = qg.id_Quyen
             WHERE qg.id_NguoiDung = ?`,
      [userId]
    );
    return rows;
  }

  static async addUserRole(userId, roleId) {
    await db.execute(
      "INSERT INTO quyenguoidung (id_NguoiDung, id_Quyen) VALUES (?, ?)",
      [userId, roleId]
    );
  }

  static async removeUserRole(userId, roleId) {
    await db.execute(
      "DELETE FROM quyenguoidung WHERE id_NguoiDung = ? AND id_Quyen = ?",
      [userId, roleId]
    );
  }
}

module.exports = User;
