// backend/controllers/quality.controller.js
const mongoose = require('mongoose');

// Verify medicine against pharmacopeial standards
exports.verifyStandard = async (req, res) => {
  try {
    const { medicine_name, batch_number, composition, manufacturer, expiry_date } = req.body;
    
    // Mock verification logic - in a real app, this would query a pharmacopeial database
    const standards = {
      'Paracetamol': { standard: 'Indian Pharmacopoeia (IP)', composition: { 'Paracetamol': '500mg' } },
      'Amoxicillin': { standard: 'United States Pharmacopeia (USP)', composition: { 'Amoxicillin': '250mg' } },
      'Ibuprofen': { standard: 'British Pharmacopoeia (BP)', composition: { 'Ibuprofen': '400mg' } }
    };
    
    const isCompliant = standards[medicine_name] !== undefined;
    
    // Send response
    res.status(200).json({
      status: isCompliant ? 'compliant' : 'non-compliant',
      matched_standard: isCompliant ? standards[medicine_name].standard : 'None',
      deviation: isCompliant ? 'None' : 'Medicine not found in standards database',
      recommendation: isCompliant ? 'Approved' : 'Rejected'
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Error verifying against pharmacopeial standards' });
  }
};

// Analyze batch for anomalies
exports.analyzeBatch = async (req, res) => {
  try {
    const { batch_number, historical_data, parameters } = req.body;
    
    // Mock anomaly detection logic - in a real app, this would use ML models
    const anomalyScore = Math.random() * 100;
    const hasAnomaly = anomalyScore > 70;
    
    // Send response
    res.status(200).json({
      status: hasAnomaly ? 'potential anomaly' : 'normal',
      confidence_score: anomalyScore.toFixed(1),
      reason: hasAnomaly ? 'Supplier has history of non-compliance' : 'No anomalies detected',
      recommendation: hasAnomaly ? 'Send for lab testing' : 'Approved for use'
    });
  } catch (error) {
    console.error('Anomaly detection error:', error);
    res.status(500).json({ message: 'Error analyzing batch for anomalies' });
  }
};

// Scan barcode 
exports.scanBarcode = async (req, res) => {
  try {
    const { barcode_id } = req.params;
    
    // Mock barcode verification logic
    const isVerified = barcode_id.length >= 10;
    
    // Send response
    res.status(200).json({
      status: isVerified ? 'verified' : 'unverified',
      medicine_name: 'Paracetamol',
      batch_number: 'P' + barcode_id.substring(0, 5),
      expiry_date: '2027-01-01',
      regulatory_approval: isVerified,
      risk_score: isVerified ? 5 : 8
    });
  } catch (error) {
    console.error('Barcode scanning error:', error);
    res.status(500).json({ message: 'Error verifying medicine via barcode' });
  }
};

// Scan RFID
exports.scanRFID = async (req, res) => {
  try {
    const { rfid_id } = req.params;
    
    // Mock RFID verification logic
    const isVerified = rfid_id.startsWith('RFID');
    
    // Send response
    res.status(200).json({
      status: isVerified ? 'verified' : 'unverified',
      medicine_name: 'Paracetamol',
      batch_number: 'P' + rfid_id.substring(4, 9),
      location: 'Hospital Storage Unit A',
      last_movement: new Date().toISOString(),
      storage_compliance: isVerified ? 'Compliant' : 'Non-compliant'
    });
  } catch (error) {
    console.error('RFID scanning error:', error);
    res.status(500).json({ message: 'Error verifying medicine via RFID' });
  }
};

// Approve or reject batch
exports.approveRejectBatch = async (req, res) => {
  try {
    const { batch_number, verification_status, anomaly_status, rfid_check } = req.body;
    
    // Decision logic
    const shouldReject = verification_status !== 'compliant' || anomaly_status === 'potential anomaly';
    
    // Send response
    res.status(200).json({
      final_decision: shouldReject ? 'Rejected' : 'Approved',
      reason: shouldReject ? 
        'Failed one or more quality checks' : 
        'Passed all quality verification checks',
      alternative_action: shouldReject ? 
        'Manual Lab Testing Recommended' : 
        'None required'
    });
  } catch (error) {
    console.error('Batch decision error:', error);
    res.status(500).json({ message: 'Error making batch approval decision' });
  }
};