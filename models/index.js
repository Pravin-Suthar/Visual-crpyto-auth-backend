const { Sequelize, DataTypes, Model } = require("sequelize");
const dbConfig = require("../config/dbConfig");

let isTestEnv = false;
if (process.env.NODE_ENV === "DEVELOPMENT") {
  isTestEnv = false;
}
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  logging: isTestEnv, // Make sure isTestEnv is correctly defined
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

// Checking connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Connected successfully");
  })
  .catch((err) => {
    console.error("Error: " + err); // Use console.error for error messages
  });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Connecting the models
db.examiners = require("./examiner")(sequelize, DataTypes);
db.tempOtp = require("./tempOtp")(sequelize, DataTypes);
db.studentMarks = require("./marks")(sequelize, DataTypes);
db.student = require("./student")(sequelize, DataTypes);
// Sync the models with the database
db.sequelize
  .sync({ force: false, alter: false })
  .then(() => {
    console.log("Model sync completed");
  })
  .catch((err) => {
    console.error("Model sync error: " + err); // Use console.error for error messages
  });

module.exports = db;
