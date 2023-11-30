const admin = require("firebase-admin");
const firebase = require("firebase/app");
const { getDatabase } = require("firebase/database");
require("firebase/storage");
require("firebase/auth");
const firebaseStorage = require("firebase/storage");
// // const { getStorage } = require("firebase-admin/storage");

const dotenv = require("dotenv");
dotenv.config({ path: "./var.env" });

const serviceAccount = require("./app-megaproyectos-firebase-adminsdk-cnt7p-61b36ec320.json");

const adminApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  authDomain: process.env.FIRE_AUTH_DOMAIN,
  databaseURL: process.env.FIRE_DATABASE_URL,
  projectId: process.env.FIRE_PROJECT_ID,
  storageBucket: process.env.FIRE_STORAGE_BUCKET,
  appId: process.env.FIRE_APP_ID,
  // measurementId: process.env.FIRE_MEASUREMENT_ID,
});

const firebaseConfig = {
  apiKey: process.env.FIRE_API_KEY,
  authDomain: process.env.FIRE_AUTH_DOMAIN,
  databaseURL: process.env.FIRE_DATABASE_URL,
  projectId: process.env.FIRE_PROJECT_ID,
  storageBucket: process.env.FIRE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIRE_MESSAGING_SENDER_ID,
  appId: process.env.FIRE_APP_ID,
  // measurementId: process.env.FIRE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
module.exports.database = getDatabase();

exports.secret = process.env.SECRET_PASS_KEY;
module.exports.adminDatabase = admin.firestore();

const storage = firebaseStorage.getStorage(app);
// module.exports.storageFire = firebase.storage();
module.exports.storageRegular = storage;
module.exports.storageAdmin = adminApp.storage();

// exports.mailDomain = process.env.MAILGUN_DOMAIN;
// exports.mailApi = process.env.MAILGUN_API_KEY;
