const factory = require("./handlerFactory");

const { adminDatabase, storageAdmin } = require("../database");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getUser = factory.getOne("users");

const verifyFiles = (files, user) => {
  const valid = files.reduce((final, cur) => {
    if (!final) return false;
    if (!user[cur]) return false;
    return true;
  }, true);

  return valid;
};

exports.uploadFile = catchAsync(async (req, res, next) => {
  const userType = req.user.role;
  const nameFilter = {
    aspirante: ["HojaDeVida", "FormatoPrueba"],
    empresa: ["Rut", "Archivo"],
  };

  const reqFile = req.file;
  const { fileId } = req.body;
  const { userId } = req.user;

  if (!nameFilter[userType].includes(fileId))
    return next(new AppError("Archivo invalido", 400));
  if (!reqFile) return next(new AppError("No se encontro el archivo", 400));

  if (reqFile.mimetype !== "application/pdf")
    next(new AppError("El formato debe ser PDF", 400));

  const userRef = adminDatabase.collection("users").doc(userId);
  const bucket = storageAdmin.bucket();
  const file = bucket.file(`pdf/${fileId}_${userId}.pdf`);

  const stream = file.createWriteStream({
    metadata: {
      contentType: "application/pdf",
    },
    resumable: false,
  });

  stream.on("error", (err) => {
    return res.status(500).json({
      status: "error",
      message: "Error uploading file",
    });
  });

  stream.on("finish", async () => {
    try {
      const encodedPath = encodeURIComponent(`pdf/${fileId}_${userId}.pdf`);
      const filerUrl = `https://firebasestorage.googleapis.com/v0/b/app-megaproyectos.appspot.com/o/${encodedPath}?alt=media`;

      const newData = {};

      newData[fileId] = filerUrl;

      const userData = { ...req.user };
      userData[fileId] = "true";

      newData.ready = `${verifyFiles(nameFilter[userType], userData)}`;

      await userRef.update(newData);

      return res.status(200).json({
        status: "success",
        message: "Image uploaded successfully.",
      });
    } catch (err) {
      console.log(err.message);
      return res.status(200).json({
        status: "success",
        message: "Error generating image link",
      });
    }
  });

  stream.end(reqFile.buffer);
});
