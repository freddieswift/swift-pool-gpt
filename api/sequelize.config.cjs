require("dotenv").config();

const shared = {
  dialect: "mysql",
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "swiftpool",
  logging: false
};

module.exports = {
  development: shared,
  test: {
    ...shared,
    database: process.env.DB_TEST_NAME || "swiftpool_test"
  },
  production: shared
};
