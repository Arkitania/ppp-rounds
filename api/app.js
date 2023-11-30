const express = require("express");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

const AppError = require("./utils/appError");
const userRouter = require("./routes/userRoutes");
const adminRouter = require("./routes/adminRoutes");
const globalErrorHandler = require("./controllers/errorController");

app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
const upload = multer({ dest: "uploads/" });
// app.use("/proxy", proxy("http://localhost:3000"));

const allowedOrigins = ["http://localhost:3000", "http://localhost"];
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow credentials
};

app.use(cors(corsOptions));

app.use("/users", userRouter);
app.use("/admin", adminRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
