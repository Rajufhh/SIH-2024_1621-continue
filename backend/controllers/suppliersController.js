const Supplier = require("../models/Supplier");
const aiController = require('../controllers/aiController');


// Fetch all suppliers sorted by rating
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ rating: -1 });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};