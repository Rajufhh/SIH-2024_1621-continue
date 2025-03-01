const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
  stock: { type: Number, required: true },
  location: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Inventory", inventorySchema);
