const express = require("express");

const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");
const factory = require("../controllers/handlerFactory");

const router = express.Router();

router.use(authController.authVerify);
router.use(authController.onlyAdmin);

router.get("/", adminController.getUsers);
router.get("/users", adminController.getUsers);

module.exports = router;
