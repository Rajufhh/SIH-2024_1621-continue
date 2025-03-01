const Order = require("../models/Order");
const AI = require("../utils/AI");

// Fetch all orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new order with AI-based demand prediction
exports.createOrder = async (req, res) => {
  try {
    const { hospitalId, medicineId, quantity } = req.body;
    const predictedDemand = await AI.predictDemand(hospitalId, medicineId);
    
    const order = new Order({ hospitalId, medicineId, quantity, predictedDemand, status: "Pending" });
    await order.save();
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
