const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  status: { type: String, enum: ["Processing", "In Transit", "Delivered"], default: "Processing" },
  trackingInfo: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Shipment", shipmentSchema);
