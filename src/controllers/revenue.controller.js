const Revenue = require("../models/revenue.model");
const ApiResponse = require("../utils/apiResponse");

exports.getRevenueStats = async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const stats = await Revenue.getRevenueStats(filters);

    // Calculate totals
    const totals = stats.reduce(
      (acc, day) => ({
        SoDonHang: acc.SoDonHang + day.SoDonHang,
        DoanhThu: acc.DoanhThu + day.DoanhThu,
        TongGiamGia: acc.TongGiamGia + day.TongGiamGia,
        TongPhiVanChuyen: acc.TongPhiVanChuyen + day.TongPhiVanChuyen,
      }),
      {
        SoDonHang: 0,
        DoanhThu: 0,
        TongGiamGia: 0,
        TongPhiVanChuyen: 0,
      }
    );

    res.json(
      ApiResponse.success("", {
        chitiet: stats,
        tongHop: totals,
      })
    );
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.getProductPerformance = async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      categoryId: req.query.categoryId,
      sortBy: req.query.sortBy,
      limit: req.query.limit,
    };

    const products = await Revenue.getProductPerformance(filters);
    res.json(ApiResponse.success("", products));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.getCategoryPerformance = async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const categories = await Revenue.getCategoryPerformance(filters);

    // Calculate percentages
    const totalRevenue = categories.reduce((sum, cat) => sum + cat.DoanhThu, 0);
    const categoriesWithPercentage = categories.map((cat) => ({
      ...cat,
      PhanTramDoanhThu: totalRevenue
        ? ((cat.DoanhThu / totalRevenue) * 100).toFixed(2)
        : 0,
    }));

    res.json(ApiResponse.success("", categoriesWithPercentage));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.getCustomerAnalytics = async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit,
    };

    const customers = await Revenue.getCustomerAnalytics(filters);
    res.json(ApiResponse.success("", customers));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.getTrendAnalysis = async (req, res) => {
  try {
    const period = req.query.period || "day";
    if (!["day", "week", "month"].includes(period)) {
      return res
        .status(400)
        .json(ApiResponse.error("Khoảng thời gian không hợp lệ"));
    }

    const trends = await Revenue.getTrendAnalysis(period);

    // Calculate growth rates
    const trendsWithGrowth = trends.map((current, index) => {
      const previous = trends[index + 1];
      let growth = 0;

      if (previous) {
        growth = (
          ((current.DoanhThu - previous.DoanhThu) / previous.DoanhThu) *
          100
        ).toFixed(2);
      }

      return {
        ...current,
        TangTruong: parseFloat(growth),
      };
    });

    res.json(ApiResponse.success("", trendsWithGrowth));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};
