const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  rating: { type: Number, default: 0 },
  medicinesSupplied: [{ type: mongoose.Schema.Types.ObjectId, ref: "Medicine" }]
});

module.exports = mongoose.model("Supplier", supplierSchema);