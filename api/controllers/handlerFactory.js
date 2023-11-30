const { adminDatabase } = require("../database");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getOne = (collectionName) =>
  catchAsync(async (req, res, next) => {
    const params = req.params;

    if (params.id) {
      const itemDoc = await adminDatabase
        .collection(collectionName)
        .doc(params.id)
        .get();

      if (!itemDoc.exists) return next(new AppError("Not found", 404));

      const dispId = collectionName === "users" ? "secret" : params.id;

      return res.status(200).json({
        status: "success",
        data: { id: dispId, ...itemDoc.data() },
      });
    }

    const itemDoc = await adminDatabase
      .collection(collectionName)
      .where(req.query.selector, "==", req.query.value)
      .limit(1)
      .get();

    if (itemDoc.empty) next(new AppError("Item not found", 404));

    const data = itemDoc.docs[0].data();
    data.id = collectionName === "users" ? "secret" : itemDoc.docs[0].id;

    res.status(200).json({
      status: "success",
      data,
    });
  });

function applyFilterToQuery(qr, filterField, filterValue, condition) {
  switch (condition) {
    case "equalTo":
      return qr.where(filterField, "==", filterValue);

    case "greaterThan":
      return qr.where(filterField, ">=", filterValue);

    case "lessThan":
      return qr.where(filterField, "<=", filterValue);

    default:
      return qr;
  }
}
exports.getMany = (collectionName) =>
  catchAsync(async (req, res, next) => {
    const perPage = req.query.items || 24;

    const collectionRef = adminDatabase.collection(collectionName);
    let queryStm = collectionRef;

    if (req.body.filters) {
      req.body.filters.forEach((fil) => {
        queryStm = applyFilterToQuery(
          queryStm,
          fil.selector,
          fil.value || null,
          fil.where || "equalTo"
        );
      });
    }

    if (req.query.next) {
      const startRef = collectionRef.doc(req.query.next);
      queryStm = queryStm.startAfter(startRef);
    }

    const querySnapshots = await queryStm.limit(perPage).get();

    const data = [];
    for (const doc of querySnapshots.docs) {
      let safeData = doc.data();

      if (collectionName == "groups") {
        const ownerRef = adminDatabase.collection("users").doc(safeData.owner);

        const ownerDoc = await ownerRef.get();
        const ownerData = ownerDoc.data();

        safeData.ownerData = {
          username: ownerData.username,
          img: ownerData.img || "default",
        };

        // Delete elements from safeData
        delete safeData.users;
        delete safeData.mods;
        delete safeData.owner;
      }

      data.push({
        id: doc.id,
        ...safeData,
      });
    }

    let lastId = null;
    if (data.length !== 0) lastId = data[data.length - 1].id;

    res.status(200).json({
      status: "success",
      data,
      lastItem: lastId,
    });
  });

exports.validateFields = (requiredFields, defaultValues) => {
  return (req, res, next) => {
    const missingFields = requiredFields.filter((field) => {
      const fieldValue = req.body[field];
      return fieldValue === undefined || fieldValue === null;
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "error",
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    if (defaultValues) {
      Object.entries(defaultValues).forEach(([field, defaultValue]) => {
        if (req.body[field] === undefined) {
          req.body[field] = defaultValue;
        }
      });
    }

    const allowedFields = [
      ...requiredFields,
      ...Object.keys(defaultValues || {}),
    ];
    for (const field in req.body) {
      if (!allowedFields.includes(field)) {
        delete req.body[field];
      }
    }

    if (defaultValues && defaultValues.owner) {
      req.body.owner = req.user.userId;
      req.body.users = [req.user.userId];
      req.body.seasonDuration = req.body.seasonDuration * 24 * 60 * 60 * 1000;
      req.body.searchIndex = [...req.body.name.split(" ")];
    }

    next();
  };
};

exports.createOne = (collectionName) =>
  catchAsync(async (req, res, next) => {
    if (collectionName === "users")
      return next(new AppError("To create an user please sign up", 400));

    const collectionRef = adminDatabase.collection(collectionName);

    const newGroupRef = await collectionRef.add({ ...req.body });

    res.status(201).json({
      status: "success",
      data: {
        id: newGroupRef.id,
        ...req.body,
      },
    });
  });

exports.update = (collectionName) =>
  catchAsync(async (req, res, next) => {
    if (collectionName === "users")
      return next(new AppError("Invalid route for user updates", 400));
    const collectionRef = adminDatabase.collection(collectionName);
    const docRef = await collectionRef.doc(req.params.id);

    const prevDoc = await docRef.get();
    if (!prevDoc.exists) return next(new AppError("Item not found", 404));

    const updatedData = { ...prevDoc.data(), ...req.body };

    updatedData.id = prevDoc.id;

    docRef.update(req.body);

    if (collectionName === "groups") {
      delete updatedData.users;
      delete updatedData.mods;
      delete updatedData.owner;
    }

    res.status(200).json({
      status: "success",
      data: updatedData,
    });
  });
