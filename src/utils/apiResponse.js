class ApiResponse {
  static success(message, data = null, statusCode = 200) {
    return {
      status: "success",
      message,
      data,
      statusCode,
    };
  }

  static error(message, statusCode = 500) {
    return {
      status: "error",
      message,
      statusCode,
    };
  }

  static pagination(data, page, limit, total) {
    return {
      status: "success",
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = ApiResponse;
