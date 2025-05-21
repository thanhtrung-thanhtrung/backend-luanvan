-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 21, 2025 at 12:08 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `shoes_shop`
--

-- --------------------------------------------------------

--
-- Table structure for table `chitietdonhang`
--

CREATE TABLE `chitietdonhang` (
  `id` int(11) NOT NULL,
  `id_DonHang` int(11) DEFAULT NULL,
  `id_SanPham_BienThe` int(11) DEFAULT NULL,
  `SoLuong` int(11) DEFAULT NULL,
  `GiaBan` decimal(15,2) DEFAULT NULL,
  `ThanhTien` decimal(15,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chitietphieunhap`
--

CREATE TABLE `chitietphieunhap` (
  `id` int(11) NOT NULL,
  `id_PhieuNhap` int(11) DEFAULT NULL,
  `id_SanPham_BienThe` int(11) DEFAULT NULL,
  `SoLuong` int(11) DEFAULT NULL,
  `GiaNhap` decimal(15,2) DEFAULT NULL,
  `ThanhTien` decimal(15,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `danhgia`
--

CREATE TABLE `danhgia` (
  `id` int(11) NOT NULL,
  `id_SanPham` int(11) DEFAULT NULL,
  `id_NguoiDung` int(11) DEFAULT NULL,
  `id_DonHang` int(11) DEFAULT NULL,
  `SoSao` int(11) DEFAULT NULL,
  `NoiDung` text DEFAULT NULL,
  `HinhAnh` varchar(255) DEFAULT NULL,
  `NgayDanhGia` datetime DEFAULT current_timestamp(),
  `TrangThai` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `danhmuc`
--

CREATE TABLE `danhmuc` (
  `id` int(11) NOT NULL,
  `Ten` varchar(100) DEFAULT NULL,
  `id_DanhMucCha` int(11) DEFAULT NULL,
  `MoTa` text DEFAULT NULL,
  `TrangThai` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `danhmuc`
--

INSERT INTO `danhmuc` (`id`, `Ten`, `id_DanhMucCha`, `MoTa`, `TrangThai`) VALUES
(1, 'Giày Nam', NULL, 'Các loại giày dành cho nam', 1),
(2, 'Giày Nữ', NULL, 'Các loại giày dành cho nữ', 1),
(3, 'Giày Thể Thao', NULL, 'Giày thể thao đa năng', 1),
(4, 'Giày Chạy Bộ', 3, 'Giày chuyên dụng cho chạy bộ', 1),
(5, 'Giày Bóng Đá', 3, 'Giày chuyên dụng cho bóng đá', 1);

-- --------------------------------------------------------

--
-- Table structure for table `donhang`
--

CREATE TABLE `donhang` (
  `id` int(11) NOT NULL,
  `MaDonHang` varchar(20) DEFAULT NULL,
  `id_NguoiMua` int(11) DEFAULT NULL,
  `TenNguoiNhan` varchar(100) DEFAULT NULL,
  `SDTNguoiNhan` varchar(15) DEFAULT NULL,
  `DiaChiNhan` varchar(255) DEFAULT NULL,
  `TongTienHang` decimal(15,2) DEFAULT 0.00,
  `PhiVanChuyen` decimal(15,2) DEFAULT 0.00,
  `GiamGia` decimal(15,2) DEFAULT 0.00,
  `TongThanhToan` decimal(15,2) DEFAULT 0.00,
  `MaGiamGia` varchar(20) DEFAULT NULL,
  `MaGiaoDich` varchar(50) DEFAULT NULL,
  `GhiChu` text DEFAULT NULL,
  `id_ThanhToan` int(11) DEFAULT NULL,
  `id_VanChuyen` int(11) DEFAULT NULL,
  `TrangThai` int(11) DEFAULT 1 COMMENT '1: Chờ xác nhận, 2: Đã xác nhận, 3: Đang giao, 4: Đã giao, 5: Đã hủy',
  `TrangThaiThanhToan` int(11) DEFAULT 0 COMMENT '0: Chưa thanh toán, 1: Đã thanh toán',
  `ThoiGianThanhToan` datetime DEFAULT NULL,
  `NgayDatHang` datetime DEFAULT current_timestamp(),
  `NgayCapNhat` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `giohang`
--

CREATE TABLE `giohang` (
  `id` int(11) NOT NULL,
  `id_NguoiDung` int(11) DEFAULT NULL,
  `id_SanPham_BienThe` int(11) DEFAULT NULL,
  `SoLuong` int(11) DEFAULT NULL,
  `NgayThem` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hinhthucthanhtoan`
--

CREATE TABLE `hinhthucthanhtoan` (
  `id` int(11) NOT NULL,
  `Ten` varchar(100) DEFAULT NULL,
  `MoTa` text DEFAULT NULL,
  `TrangThai` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hinhthucthanhtoan`
--

INSERT INTO `hinhthucthanhtoan` (`id`, `Ten`, `MoTa`, `TrangThai`) VALUES
(1, 'Tiền mặt', 'Thanh toán khi nhận hàng', 1),
(2, 'Chuyển khoản', 'Chuyển khoản ngân hàng', 1),
(3, 'Thẻ tín dụng', 'Thanh toán qua thẻ tín dụng', 1);

-- --------------------------------------------------------

--
-- Table structure for table `hinhthucvanchuyen`
--

CREATE TABLE `hinhthucvanchuyen` (
  `id` int(11) NOT NULL,
  `Ten` varchar(100) DEFAULT NULL,
  `MoTa` text DEFAULT NULL,
  `PhiVanChuyen` decimal(15,2) DEFAULT 0.00,
  `ThoiGianDuKien` varchar(50) DEFAULT NULL,
  `TrangThai` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hinhthucvanchuyen`
--

INSERT INTO `hinhthucvanchuyen` (`id`, `Ten`, `MoTa`, `PhiVanChuyen`, `ThoiGianDuKien`, `TrangThai`) VALUES
(1, 'Giao hàng tiêu chuẩn', 'Giao hàng trong 2-3 ngày', 30000.00, '2-3 ngày', 1),
(2, 'Giao hàng nhanh', 'Giao hàng trong 1-2 ngày', 50000.00, '1-2 ngày', 1),
(3, 'Giao hàng siêu tốc', 'Giao hàng trong ngày', 80000.00, 'Trong ngày', 1);

-- --------------------------------------------------------

--
-- Table structure for table `kichco`
--

CREATE TABLE `kichco` (
  `id` int(11) NOT NULL,
  `Ten` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kichco`
--

INSERT INTO `kichco` (`id`, `Ten`) VALUES
(1, '36'),
(2, '37'),
(3, '38'),
(4, '39'),
(5, '40'),
(6, '41'),
(7, '42'),
(8, '43'),
(9, '44'),
(10, '45');

-- --------------------------------------------------------

--
-- Table structure for table `magiamgia`
--

CREATE TABLE `magiamgia` (
  `Ma` varchar(20) NOT NULL,
  `Ten` varchar(100) DEFAULT NULL,
  `MoTa` text DEFAULT NULL,
  `PhanTramGiam` int(11) DEFAULT NULL,
  `GiaTriGiamToiDa` decimal(15,2) DEFAULT NULL,
  `NgayBatDau` datetime DEFAULT NULL,
  `NgayKetThuc` datetime DEFAULT NULL,
  `SoLuotSuDung` int(11) DEFAULT NULL,
  `SoLuotDaSuDung` int(11) DEFAULT 0,
  `DieuKienApDung` decimal(15,2) DEFAULT 0.00,
  `TrangThai` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `magiamgia`
--

INSERT INTO `magiamgia` (`Ma`, `Ten`, `MoTa`, `PhanTramGiam`, `GiaTriGiamToiDa`, `NgayBatDau`, `NgayKetThuc`, `SoLuotSuDung`, `SoLuotDaSuDung`, `DieuKienApDung`, `TrangThai`) VALUES
('SUMMER20', 'Hè rực rỡ', 'Giảm 20% cho đơn hàng mùa hè', 20, 200000.00, '2024-06-01 00:00:00', '2024-08-31 00:00:00', 500, 0, 1000000.00, 1),
('WELCOME10', 'Chào mừng', 'Giảm 10% cho đơn hàng đầu tiên', 10, 100000.00, '2024-01-01 00:00:00', '2024-12-31 00:00:00', 1000, 0, 500000.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `mausac`
--

CREATE TABLE `mausac` (
  `id` int(11) NOT NULL,
  `Ten` varchar(50) DEFAULT NULL,
  `MaMau` varchar(7) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mausac`
--

INSERT INTO `mausac` (`id`, `Ten`, `MaMau`) VALUES
(1, 'Đen', '#000000'),
(2, 'Trắng', '#FFFFFF'),
(3, 'Đỏ', '#FF0000'),
(4, 'Xanh Dương', '#0000FF'),
(5, 'Xanh Lá', '#00FF00');

-- --------------------------------------------------------

--
-- Table structure for table `nguoidung`
--

CREATE TABLE `nguoidung` (
  `id` int(11) NOT NULL,
  `HoTen` varchar(100) DEFAULT NULL,
  `DiaChi` varchar(255) DEFAULT NULL,
  `SDT` varchar(15) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `MatKhau` varchar(100) DEFAULT NULL,
  `salt` varchar(32) DEFAULT NULL,
  `reset_token` varchar(100) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  `TrangThai` int(11) DEFAULT 1,
  `NgayTao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `nguoidung`
--

INSERT INTO `nguoidung` (`id`, `HoTen`, `DiaChi`, `SDT`, `Email`, `MatKhau`, `salt`, `reset_token`, `reset_token_expiry`, `TrangThai`, `NgayTao`) VALUES
(1, 'Admin', 'Quận 1, TP.HCM', '0123456789', 'admin@example.com', 'hashed_password', 'salt123', NULL, NULL, 1, '2025-05-19 03:13:12'),
(2, 'Nguyễn Văn A', 'Quận 2, TP.HCM', '0987654321', 'nguyenvana@example.com', 'hashed_password', 'salt456', NULL, NULL, 1, '2025-05-19 03:13:12'),
(3, 'Trần Thị B', 'Quận 3, TP.HCM', '0912345678', 'tranthib@example.com', 'hashed_password', 'salt789', NULL, NULL, 1, '2025-05-19 03:13:12');

-- --------------------------------------------------------

--
-- Table structure for table `nhacungcap`
--

CREATE TABLE `nhacungcap` (
  `id` int(11) NOT NULL,
  `Ten` varchar(100) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `SDT` varchar(15) DEFAULT NULL,
  `DiaChi` varchar(255) DEFAULT NULL,
  `TrangThai` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `nhacungcap`
--

INSERT INTO `nhacungcap` (`id`, `Ten`, `Email`, `SDT`, `DiaChi`, `TrangThai`) VALUES
(1, 'Nike Việt Nam', 'contact@nike.vn', '02812345678', 'Quận 1, TP.HCM', 1),
(2, 'Adidas Việt Nam', 'contact@adidas.vn', '02887654321', 'Quận 2, TP.HCM', 1),
(3, 'Puma Việt Nam', 'contact@puma.vn', '02898765432', 'Quận 3, TP.HCM', 1);

-- --------------------------------------------------------

--
-- Table structure for table `phieunhap`
--

CREATE TABLE `phieunhap` (
  `id` int(11) NOT NULL,
  `MaPhieuNhap` varchar(20) DEFAULT NULL,
  `id_NhaCungCap` int(11) DEFAULT NULL,
  `id_NguoiTao` int(11) DEFAULT NULL,
  `TongTien` decimal(15,2) DEFAULT 0.00,
  `GhiChu` text DEFAULT NULL,
  `NgayNhap` datetime DEFAULT current_timestamp(),
  `TrangThai` int(11) DEFAULT 1 COMMENT '1: Chờ xác nhận, 2: Đã nhập kho, 3: Đã hủy'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quyen`
--

CREATE TABLE `quyen` (
  `id` int(11) NOT NULL,
  `TenQuyen` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quyen`
--

INSERT INTO `quyen` (`id`, `TenQuyen`) VALUES
(1, 'Admin'),
(2, 'Nhân viên'),
(3, 'Khách hàng');

-- --------------------------------------------------------

--
-- Table structure for table `quyenguoidung`
--

CREATE TABLE `quyenguoidung` (
  `id` int(11) NOT NULL,
  `id_Quyen` int(11) DEFAULT NULL,
  `id_NguoiDung` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quyenguoidung`
--

INSERT INTO `quyenguoidung` (`id`, `id_Quyen`, `id_NguoiDung`) VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, 3);

-- --------------------------------------------------------

--
-- Table structure for table `sanpham`
--

CREATE TABLE `sanpham` (
  `id` int(11) NOT NULL,
  `Ten` varchar(100) DEFAULT NULL,
  `MoTa` text DEFAULT NULL,
  `MoTaChiTiet` text DEFAULT NULL,
  `ThongSoKyThuat` text DEFAULT NULL,
  `Gia` decimal(15,2) DEFAULT NULL,
  `GiaKhuyenMai` decimal(15,2) DEFAULT NULL,
  `SoLuong` int(11) DEFAULT 0,
  `SoLuongDaBan` int(11) DEFAULT 0,
  `id_DanhMuc` int(11) DEFAULT NULL,
  `id_ThuongHieu` int(11) DEFAULT NULL,
  `id_NhaCungCap` int(11) DEFAULT NULL,
  `HinhAnh` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Format: {"anhChinh": "url", "anhPhu": ["url1", "url2", ...]}' CHECK (json_valid(`HinhAnh`)),
  `TrangThai` int(11) DEFAULT 1,
  `DacTrung` tinyint(1) DEFAULT 0,
  `MoiNhat` tinyint(1) DEFAULT 0,
  `BanChay` tinyint(1) DEFAULT 0,
  `NgayTao` datetime DEFAULT current_timestamp(),
  `NgayCapNhat` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sanpham`
--

INSERT INTO `sanpham` (`id`, `Ten`, `MoTa`, `MoTaChiTiet`, `ThongSoKyThuat`, `Gia`, `GiaKhuyenMai`, `SoLuong`, `SoLuongDaBan`, `id_DanhMuc`, `id_ThuongHieu`, `id_NhaCungCap`, `HinhAnh`, `TrangThai`, `DacTrung`, `MoiNhat`, `BanChay`, `NgayTao`, `NgayCapNhat`) VALUES
(1, 'Nike Air Max 270', 'Giày thể thao Nike Air Max 270', 'Chi tiết sản phẩm Nike Air Max 270', '{\"Chất liệu\": \"Da tổng hợp\", \"Đế\": \"Cao su\"}', 3500000.00, 3150000.00, 100, 0, 3, 1, 1, '{\"anhChinh\": \"nike-air-max-270.jpg\", \"anhPhu\": [\"nike-air-max-270-1.jpg\", \"nike-air-max-270-2.jpg\"]}', 1, 1, 1, 1, '2025-05-19 03:13:12', '2025-05-19 03:13:12'),
(2, 'Adidas Ultraboost 22', 'Giày chạy bộ Adidas Ultraboost 22', 'Chi tiết sản phẩm Adidas Ultraboost 22', '{\"Chất liệu\": \"Primeknit\", \"Đế\": \"Boost\"}', 4200000.00, 3780000.00, 80, 0, 4, 2, 2, '{\"anhChinh\": \"adidas-ultraboost-22.jpg\", \"anhPhu\": [\"adidas-ultraboost-22-1.jpg\", \"adidas-ultraboost-22-2.jpg\"]}', 1, 0, 1, 1, '2025-05-19 03:13:12', '2025-05-19 03:13:12');

-- --------------------------------------------------------

--
-- Table structure for table `sanpham_bien_the`
--

CREATE TABLE `sanpham_bien_the` (
  `id` int(11) NOT NULL,
  `id_SanPham` int(11) DEFAULT NULL,
  `id_KichCo` int(11) DEFAULT NULL,
  `id_MauSac` int(11) DEFAULT NULL,
  `SoLuong` int(11) DEFAULT 0,
  `SKU` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sanpham_bien_the`
--

INSERT INTO `sanpham_bien_the` (`id`, `id_SanPham`, `id_KichCo`, `id_MauSac`, `SoLuong`, `SKU`) VALUES
(1, 1, 1, 1, 10, 'NK-AM270-36-BLK'),
(2, 1, 2, 2, 10, 'NK-AM270-37-WHT'),
(3, 2, 3, 3, 10, 'AD-UB22-38-RED'),
(4, 2, 4, 4, 10, 'AD-UB22-39-BLU');

-- --------------------------------------------------------

--
-- Table structure for table `thuonghieu`
--

CREATE TABLE `thuonghieu` (
  `id` int(11) NOT NULL,
  `Ten` varchar(100) DEFAULT NULL,
  `MoTa` text DEFAULT NULL,
  `Logo` varchar(255) DEFAULT NULL,
  `Website` varchar(255) DEFAULT NULL,
  `TrangThai` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `thuonghieu`
--

INSERT INTO `thuonghieu` (`id`, `Ten`, `MoTa`, `Logo`, `Website`, `TrangThai`) VALUES
(1, 'Nike', 'Thương hiệu thể thao hàng đầu thế giới', 'nike-logo.png', 'https://nike.com', 1),
(2, 'Adidas', 'Thương hiệu thể thao nổi tiếng', 'adidas-logo.png', 'https://adidas.com', 1),
(3, 'Puma', 'Thương hiệu thể thao đẳng cấp', 'puma-logo.png', 'https://puma.com', 1);

-- --------------------------------------------------------

--
-- Table structure for table `wishlist`
--

CREATE TABLE `wishlist` (
  `id` int(11) NOT NULL,
  `id_NguoiDung` int(11) DEFAULT NULL,
  `id_SanPham` int(11) DEFAULT NULL,
  `NgayThem` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `chitietdonhang`
--
ALTER TABLE `chitietdonhang`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_DonHang` (`id_DonHang`),
  ADD KEY `id_SanPham_BienThe` (`id_SanPham_BienThe`);

--
-- Indexes for table `chitietphieunhap`
--
ALTER TABLE `chitietphieunhap`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_PhieuNhap` (`id_PhieuNhap`),
  ADD KEY `id_SanPham_BienThe` (`id_SanPham_BienThe`);

--
-- Indexes for table `danhgia`
--
ALTER TABLE `danhgia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_SanPham` (`id_SanPham`),
  ADD KEY `id_NguoiDung` (`id_NguoiDung`),
  ADD KEY `id_DonHang` (`id_DonHang`);

--
-- Indexes for table `danhmuc`
--
ALTER TABLE `danhmuc`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `donhang`
--
ALTER TABLE `donhang`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `MaDonHang` (`MaDonHang`),
  ADD KEY `id_NguoiMua` (`id_NguoiMua`),
  ADD KEY `MaGiamGia` (`MaGiamGia`),
  ADD KEY `id_ThanhToan` (`id_ThanhToan`),
  ADD KEY `id_VanChuyen` (`id_VanChuyen`);

--
-- Indexes for table `giohang`
--
ALTER TABLE `giohang`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_NguoiDung` (`id_NguoiDung`),
  ADD KEY `id_SanPham_BienThe` (`id_SanPham_BienThe`);

--
-- Indexes for table `hinhthucthanhtoan`
--
ALTER TABLE `hinhthucthanhtoan`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hinhthucvanchuyen`
--
ALTER TABLE `hinhthucvanchuyen`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `kichco`
--
ALTER TABLE `kichco`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `magiamgia`
--
ALTER TABLE `magiamgia`
  ADD PRIMARY KEY (`Ma`);

--
-- Indexes for table `mausac`
--
ALTER TABLE `mausac`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nguoidung`
--
ALTER TABLE `nguoidung`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- Indexes for table `nhacungcap`
--
ALTER TABLE `nhacungcap`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `phieunhap`
--
ALTER TABLE `phieunhap`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `MaPhieuNhap` (`MaPhieuNhap`),
  ADD KEY `id_NhaCungCap` (`id_NhaCungCap`),
  ADD KEY `id_NguoiTao` (`id_NguoiTao`);

--
-- Indexes for table `quyen`
--
ALTER TABLE `quyen`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `quyenguoidung`
--
ALTER TABLE `quyenguoidung`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_Quyen` (`id_Quyen`),
  ADD KEY `id_NguoiDung` (`id_NguoiDung`);

--
-- Indexes for table `sanpham`
--
ALTER TABLE `sanpham`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_DanhMuc` (`id_DanhMuc`),
  ADD KEY `id_ThuongHieu` (`id_ThuongHieu`),
  ADD KEY `id_NhaCungCap` (`id_NhaCungCap`);

--
-- Indexes for table `sanpham_bien_the`
--
ALTER TABLE `sanpham_bien_the`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_SanPham` (`id_SanPham`),
  ADD KEY `id_KichCo` (`id_KichCo`),
  ADD KEY `id_MauSac` (`id_MauSac`);

--
-- Indexes for table `thuonghieu`
--
ALTER TABLE `thuonghieu`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_wishlist` (`id_NguoiDung`,`id_SanPham`),
  ADD KEY `id_NguoiDung` (`id_NguoiDung`),
  ADD KEY `id_SanPham` (`id_SanPham`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `chitietdonhang`
--
ALTER TABLE `chitietdonhang`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chitietphieunhap`
--
ALTER TABLE `chitietphieunhap`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `danhgia`
--
ALTER TABLE `danhgia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `danhmuc`
--
ALTER TABLE `danhmuc`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `donhang`
--
ALTER TABLE `donhang`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `giohang`
--
ALTER TABLE `giohang`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hinhthucthanhtoan`
--
ALTER TABLE `hinhthucthanhtoan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `hinhthucvanchuyen`
--
ALTER TABLE `hinhthucvanchuyen`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `kichco`
--
ALTER TABLE `kichco`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `mausac`
--
ALTER TABLE `mausac`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `nguoidung`
--
ALTER TABLE `nguoidung`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `nhacungcap`
--
ALTER TABLE `nhacungcap`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `phieunhap`
--
ALTER TABLE `phieunhap`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quyen`
--
ALTER TABLE `quyen`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `quyenguoidung`
--
ALTER TABLE `quyenguoidung`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `sanpham`
--
ALTER TABLE `sanpham`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `sanpham_bien_the`
--
ALTER TABLE `sanpham_bien_the`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `thuonghieu`
--
ALTER TABLE `thuonghieu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `chitietdonhang`
--
ALTER TABLE `chitietdonhang`
  ADD CONSTRAINT `chitietdonhang_ibfk_1` FOREIGN KEY (`id_DonHang`) REFERENCES `donhang` (`id`),
  ADD CONSTRAINT `chitietdonhang_ibfk_2` FOREIGN KEY (`id_SanPham_BienThe`) REFERENCES `sanpham_bien_the` (`id`);

--
-- Constraints for table `chitietphieunhap`
--
ALTER TABLE `chitietphieunhap`
  ADD CONSTRAINT `chitietphieunhap_ibfk_1` FOREIGN KEY (`id_PhieuNhap`) REFERENCES `phieunhap` (`id`),
  ADD CONSTRAINT `chitietphieunhap_ibfk_2` FOREIGN KEY (`id_SanPham_BienThe`) REFERENCES `sanpham_bien_the` (`id`);

--
-- Constraints for table `danhgia`
--
ALTER TABLE `danhgia`
  ADD CONSTRAINT `danhgia_ibfk_1` FOREIGN KEY (`id_SanPham`) REFERENCES `sanpham` (`id`),
  ADD CONSTRAINT `danhgia_ibfk_2` FOREIGN KEY (`id_NguoiDung`) REFERENCES `nguoidung` (`id`),
  ADD CONSTRAINT `danhgia_ibfk_3` FOREIGN KEY (`id_DonHang`) REFERENCES `donhang` (`id`);

--
-- Constraints for table `donhang`
--
ALTER TABLE `donhang`
  ADD CONSTRAINT `donhang_ibfk_1` FOREIGN KEY (`id_NguoiMua`) REFERENCES `nguoidung` (`id`),
  ADD CONSTRAINT `donhang_ibfk_2` FOREIGN KEY (`MaGiamGia`) REFERENCES `magiamgia` (`Ma`),
  ADD CONSTRAINT `donhang_ibfk_3` FOREIGN KEY (`id_ThanhToan`) REFERENCES `hinhthucthanhtoan` (`id`),
  ADD CONSTRAINT `donhang_ibfk_4` FOREIGN KEY (`id_VanChuyen`) REFERENCES `hinhthucvanchuyen` (`id`);

--
-- Constraints for table `giohang`
--
ALTER TABLE `giohang`
  ADD CONSTRAINT `giohang_ibfk_1` FOREIGN KEY (`id_NguoiDung`) REFERENCES `nguoidung` (`id`),
  ADD CONSTRAINT `giohang_ibfk_2` FOREIGN KEY (`id_SanPham_BienThe`) REFERENCES `sanpham_bien_the` (`id`);

--
-- Constraints for table `phieunhap`
--
ALTER TABLE `phieunhap`
  ADD CONSTRAINT `phieunhap_ibfk_1` FOREIGN KEY (`id_NhaCungCap`) REFERENCES `nhacungcap` (`id`),
  ADD CONSTRAINT `phieunhap_ibfk_2` FOREIGN KEY (`id_NguoiTao`) REFERENCES `nguoidung` (`id`);

--
-- Constraints for table `quyenguoidung`
--
ALTER TABLE `quyenguoidung`
  ADD CONSTRAINT `quyenguoidung_ibfk_1` FOREIGN KEY (`id_Quyen`) REFERENCES `quyen` (`id`),
  ADD CONSTRAINT `quyenguoidung_ibfk_2` FOREIGN KEY (`id_NguoiDung`) REFERENCES `nguoidung` (`id`);

--
-- Constraints for table `sanpham`
--
ALTER TABLE `sanpham`
  ADD CONSTRAINT `sanpham_ibfk_1` FOREIGN KEY (`id_DanhMuc`) REFERENCES `danhmuc` (`id`),
  ADD CONSTRAINT `sanpham_ibfk_2` FOREIGN KEY (`id_ThuongHieu`) REFERENCES `thuonghieu` (`id`),
  ADD CONSTRAINT `sanpham_ibfk_3` FOREIGN KEY (`id_NhaCungCap`) REFERENCES `nhacungcap` (`id`);

--
-- Constraints for table `sanpham_bien_the`
--
ALTER TABLE `sanpham_bien_the`
  ADD CONSTRAINT `sanpham_bien_the_ibfk_1` FOREIGN KEY (`id_SanPham`) REFERENCES `sanpham` (`id`),
  ADD CONSTRAINT `sanpham_bien_the_ibfk_2` FOREIGN KEY (`id_KichCo`) REFERENCES `kichco` (`id`),
  ADD CONSTRAINT `sanpham_bien_the_ibfk_3` FOREIGN KEY (`id_MauSac`) REFERENCES `mausac` (`id`);

--
-- Constraints for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`id_NguoiDung`) REFERENCES `nguoidung` (`id`),
  ADD CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`id_SanPham`) REFERENCES `sanpham` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
