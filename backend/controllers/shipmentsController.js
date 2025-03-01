const Shipment = require("../models/Shipment");
const Blockchain = require("../utils/Blockchain");

// Fetch all shipments
exports.getShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find();
    res.json(shipments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Track a shipment using blockchain
exports.trackShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const shipment = await Blockchain.getShipmentDetails(id);
    res.json(shipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
