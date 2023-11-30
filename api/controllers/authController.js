const jwt = require("jsonwebtoken");

const admin = require("firebase-admin");
const fireAuth = require("firebase/auth");
const validator = require("validator");

const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { adminDatabase, secret } = require("../database");

const validatePassword = (pass, passConfirm) => {
  if (pass !== passConfirm)
    return { msg: "Passwords don't match", status: "error" };

  if (pass.length < 8)
    return {
      msg: "Password must have more than 8 characters",
      status: "error",
    };

  if (!/[A-Z]/.test(pass))
    return {
      msg: "Passwords must have at least one capital letter",
      status: "error",
    };

  return { msg: "Password is Valid", status: "success" };
};

const generateToken = (email) => {
  const oneWeek = 7 * 24 * 60 * 60;
  const lowerEmail = email.toLowerCase();

  const payload = {
    email: lowerEmail,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + oneWeek,
  };

  try {
    const token = jwt.sign(payload, secret);
    return token;
  } catch (err) {
    throw new AppError("Unable to generate token", 500);
  }
};

const filterUserData = (role, data) => {
  if (role === "aspirante") {
    if (!data.cedula || !data.nombre) return null;
    return { cedula: data.cedula, nombre: data.nombre };
  }
  if (role === "empresa") {
    if (!data.nit || !data.razonSocial) return null;
    return { cedula: data.nit, nombre: data.razonSocial };
  }
  return null;
};

exports.signup = catchAsync(async (req, res, next) => {
  const { email, role, password, passwordConfirm, userData } = req.body;

  if (role !== "aspirante" && role !== "empresa")
    return next(new AppError("Rol Invalido", 400));

  const filteredData = filterUserData(role, userData);

  if (!filteredData) return next(new AppError("Datos Invalidos", 400));

  const passValidation = validatePassword(password, passwordConfirm);

  if (!validator.isEmail(email))
    return next(new AppError("Email Invalido", 400));

  if (passValidation.status === "error")
    return next(new AppError(passValidation.msg, 400));

  const usersRef = adminDatabase.collection("users");

  if (
    await admin
      .auth()
      .getUserByEmail(email)
      .catch(() => false)
  )
    return next(new AppError("Email ya esta en uso", 400));

  const userRecord = await admin.auth().createUser({
    email,
    password,
  });

  const userRef = usersRef.doc(userRecord.uid);
  await userRef.set({
    email: email.toLowerCase(),
    role,
    ...userData,
    ready: "false",
    logActive: true,
  });

  try {
    const token = generateToken(email);

    res.status(200).json({
      status: "success",
      data: req.body,
      token,
    });

    // res
    //   .cookie("authToken", token, {
    //     httpOnly: true,
    //     sameSite: "strict", // Adjust as needed
    //     // secure: true, // Enable in production with HTTPS
    //   })
    //   .status(200)
    //   .json({ message: "Sign up successful" });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const au = fireAuth.getAuth();
    const userCredential = await fireAuth.signInWithEmailAndPassword(
      au,
      email,
      password
    );

    const user = userCredential.user;

    const userRef = adminDatabase.collection("users").doc(user.uid);

    await userRef.update({ logActive: true });

    const token = generateToken(user.email);

    res.status(200).json({
      status: "success",
      token,
    });

    // res
    //   .cookie("authToken", token, {
    //     httpOnly: false,
    //     sameSite: "None", // Adjust as needed
    //     // secure: true, // Enable in production with HTTPS
    //   })
    //   .status(200)
    //   .json({ message: "Login successful" });
  } catch (err) {
    return next(new AppError("E-mail or Contraseña Invalidos", 400));
  }
});

exports.validToken = catchAsync(async (req, res, next) => {
  res.status(200).json({ message: "Token valido", status: "success" });
});

exports.authVerify = catchAsync(async (req, res, next) => {
  const authToken = req.cookies.authToken;

  const returnError = (msg = "Por favor ingresar") =>
    next(new AppError(msg, 400));

  if (!authToken) return returnError();

  try {
    const valid = jwt.verify(authToken, secret);

    const userRef = adminDatabase
      .collection("users")
      .where("email", "==", valid.email);

    const usernameSnapshot = await userRef.get();

    if (usernameSnapshot.empty)
      return next(new AppError("Usuario no encontrado", 404));

    let userVals;
    usernameSnapshot.forEach((doc) => {
      userVals = doc.data();
    });

    req.user = { ...userVals, userId: usernameSnapshot.docs[0].id };

    return next();
  } catch (err) {
    return returnError("Por favor ingresar");
  }
});

exports.onlyAdmin = catchAsync(async (req, res, next) => {
  if (req.user.role !== "admin")
    return next(new AppError("No autorizado", 400));
  next();
});

exports.logout = catchAsync(async (req, res, next) => {
  try {
    const userRef = adminDatabase.collection("users").doc(req.user.userId);
    await userRef.update({ logActive: false });
  } catch (err) {
    return next(new AppError("Error Saliendo", 500));
  }

  res.clearCookie("authToken");
  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { password, passwordConfirm } = req.body;

  const passValidation = validatePassword(password, passwordConfirm);

  if (passValidation.status === "error")
    return next(new AppError(passValidation.msg, 400));

  try {
    await admin.auth().updateUser(user.userId, {
      password,
    });
  } catch (err) {
    return next(new AppError("Error Cambiando Contraseña", 400));
  }

  res.status(200).json({
    status: "success",
    message: "Contraseña actualizada!",
  });
});

exports.sendRecovery = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new AppError("Email invalido", 404));

  const usersCollection = adminDatabase.collection("users");

  const userSnap = await usersCollection
    .where("email", "==", email)
    .limit(1)
    .get();

  if (userSnap.empty) return next(new AppError("Usuario no encontrado", 404));

  try {
    async function sendEmail() {}

    sendEmail();
  } catch (err) {
    return next(new AppError("Error enviando email", 400));
  }

  res.status(200).json({
    status: "success",
    message: "Email enviado!",
  });
});
