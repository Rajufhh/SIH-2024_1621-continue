const express = require("express");
const router = express.Router();
const { getOrders, createOrder } = require("../controllers/ordersController");
const { getSuppliers } = require("../controllers/suppliersController");
const { getInventory } = require("../controllers/inventoryController");
const { getShipments, trackShipment } = require("../controllers/shipmentsController");
const { predictDemand } = require("../controllers/aiController");
const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const Supplier = require("../models/Supplier");
const Shipment = require("../models/Shipment");
const Blockchain = require("../utils/Blockchain"); // Blockchain integration
const AI = require("../utils/AI"); // AI-powered demand forecasting

// Orders Routes
router.get("/orders", getOrders);
router.post("/orders", async (req, res) => {
  try {
    const { hospitalId, medicineId, quantity } = req.body;
    const predictedDemand = await AI.predictDemand(hospitalId, medicineId);
    const order = new Order({ hospitalId, medicineId, quantity, predictedDemand, status: "Pending" });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Suppliers Route
router.get("/suppliers", async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ rating: -1 });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Inventory Route
router.get("/inventory", getInventory);

// Shipments Routes
router.get("/shipments", getShipments);
router.get("/shipments/:id", trackShipment);
router.post("/shipments", async (req, res) => {
  try {
    const { orderId, status, trackingInfo } = req.body;
    const shipment = new Shipment({ orderId, status, trackingInfo });
    await shipment.save();
    
    // Add shipment data to blockchain for transparency
    await Blockchain.recordShipment(orderId, status, trackingInfo);
    
    res.status(201).json(shipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Demand Prediction Route
router.post("/predict-demand", predictDemand);

module.exports = router;