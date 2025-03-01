import axios from "axios";

const API_BASE_URL = "http://localhost:5000"; // Adjust if needed

// Fetch Orders
export const fetchOrders = async () => {
  const response = await axios.get(`${API_BASE_URL}/orders`);
  return response.data;
};

// Place a New Order
export const createOrder = async (orderData) => {
  const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
  return response.data;
};

// Fetch Suppliers
export const fetchSuppliers = async () => {
  const response = await axios.get(`${API_BASE_URL}/suppliers`);
  return response.data;
};

// Fetch Inventory
export const fetchInventory = async () => {
  const response = await axios.get(`${API_BASE_URL}/inventory`);
  return response.data;
};

// Fetch Shipments
export const fetchShipments = async () => {
  const response = await axios.get(`${API_BASE_URL}/shipments`);
  return response.data;
};

// Track a specific shipment using Blockchain
export const trackShipment = async (shipmentId) => {
  const response = await axios.get(`${API_BASE_URL}/shipments/${shipmentId}`);
  return response.data;
};

// Predict demand using AI
export const predictDemand = async (hospitalId, medicineId) => {
  const response = await axios.post(`${API_BASE_URL}/predict-demand`, { hospitalId, medicineId });
  return response.data;
};
