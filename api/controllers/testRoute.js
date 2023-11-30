const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

exports.testGetone = catchAsync(async (req, res, next) => {
  const item = await factory.getOne("users", {
    field: "username",
    value: "testUser",
  });

  res.status(200).json({
    status: "success",
    data: item,
  });
});

exports.testGetTwo = factory.getOne("users");

exports.testGetMany = factory.getMany("groups");

exports.testCreateOne = factory.createOne("groups");

exports.testUpdate = factory.update("groups");
