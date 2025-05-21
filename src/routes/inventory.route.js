const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

// Tất cả routes yêu cầu đăng nhập và quyền admin
router.use(authenticate, isAdmin);

// Quản lý nhập kho
router.post('/stock-entries', inventoryController.createStockEntry);
router.get('/stock-entries', inventoryController.getStockEntries);
router.get('/stock-entries/:id', inventoryController.getStockEntryDetails);

// Thống kê và báo cáo kho
router.get('/stats', inventoryController.getInventoryStats);
router.get('/low-stock', inventoryController.getLowStockProducts);

module.exports = router;