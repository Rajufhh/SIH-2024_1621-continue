const predictDemand = async (req, res) => {
  try {
    const { hospitalId, medicineId } = req.body;
    // Add logic to predict demand (perhaps using ML model or a mock for testing)
    const predictedDemand = await AI.predictDemand(hospitalId, medicineId);
    res.json({ predictedDemand });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { predictDemand };
