const mongoose = require("mongoose");
require("dotenv").config();

const database = () => {
  mongoose.connect(process.env.DATABASE_URL);
  const db = mongoose.connection;
  db.on("connected", function () {
    console.log(`Connected to MongoDB ${db.name} at ${db.host}:${db.port}`);
  });
};

module.exports = { database};
