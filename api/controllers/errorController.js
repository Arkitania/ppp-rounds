const AppError = require("../utils/appError");

const errorHandler = (err, req, res, next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: "error",
      message: `Something went wrong: ${err.message}`,
    });
  }

  console.log(err);

  return res.status(500).json({
    status: "error",
    message: `Something went wrong`,
  });
};

module.exports = errorHandler;
