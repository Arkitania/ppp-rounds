const express = require("express");
const multer = require("multer");
const multerStorage = multer.memoryStorage();
const multerUpload = multer({ multerStorage });
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const router = express.Router();
const AppError = require("../utils/appError");

router.get("/user", userController.getUser);

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/recover", authController.sendRecovery);

router.use(authController.authVerify);

router.post(
  "/uploadFile",
  multerUpload.single("file"),
  userController.uploadFile
);

router.get("/verify", authController.validToken);
router.post("/changePassword", authController.changePassword);

router.post("/logout", authController.logout);

router.use((req, res, next) => next(new AppError("User route not found", 404)));

module.exports = router;
