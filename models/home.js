const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const homeSchema = new Schema({
  price: String,
  tourUrl: String,
  address: String,
  zillowId: String,
});


module.exports = mongoose.model("Home", homeSchema)