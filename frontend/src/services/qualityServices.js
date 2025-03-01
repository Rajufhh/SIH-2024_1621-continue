

// frontend/src/services/qualityService.js
const API_URL = 'http://127.0.0.1:8000/docs/';

// Get the auth token
const getToken = () => {
  return localStorage.getItem('token');
};

// API headers with auth token
const headers = () => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
};

// Verify medicine against pharmacopeial standards
export const verifyStandard = async (medicineData) => {
  try {
    const response = await fetch(`${API_URL}/verify-standard`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(medicineData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error verifying standard:', error);
    throw error;
  }
};

// Analyze batch for anomalies
export const analyzeBatch = async (batchData) => {
  try {
    const response = await fetch(`${API_URL}/analyze-batch`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(batchData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error analyzing batch:', error);
    throw error;
  }
};

// Scan barcode
export const scanBarcode = async (barcodeId) => {
  try {
    const response = await fetch(`${API_URL}/scan-barcode/${barcodeId}`, {
      method: 'GET',
      headers: headers()
    });
    return await response.json();
  } catch (error) {
    console.error('Error scanning barcode:', error);
    throw error;
  }
};

// Scan RFID
export const scanRFID = async (rfidId) => {
  try {
    const response = await fetch(`${API_URL}/scan-rfid/${rfidId}`, {
      method: 'GET',
      headers: headers()
    });
    return await response.json();
  } catch (error) {
    console.error('Error scanning RFID:', error);
    throw error;
  }
};

// Approve or reject batch
export const approveRejectBatch = async (batchDecisionData) => {
  try {
    const response = await fetch(`${API_URL}/approve-reject`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(batchDecisionData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error with batch decision:', error);
    throw error;
  }
};