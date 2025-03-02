import axios from "axios";

const API_BASE_URL = "http://localhost:8001/api/supplychain"; // Update if deployed

export const fetchChatbotResponse = async (userInput) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/chatbot`, { input: userInput });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching chatbot response:", error);
    throw error;
  }
};

// ✅ Fetch All Orders
export const fetchOrders = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/orders`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    throw error;
  }
};

// ✅ Place a New Order with AI Prediction
export const createOrder = async (orderData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
    return response.data;
  } catch (error) {
    console.error("❌ Error placing order:", error);
    throw error;
  }
};

// ✅ Fetch Suppliers (Sorted by Rating)
export const fetchSuppliers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/suppliers`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching suppliers:", error);
    throw error;
  }
};

// ✅ Fetch Inventory (Stock Levels)
export const fetchInventory = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/inventory`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching inventory:", error);
    throw error;
  }
};

// ✅ Track Shipments (Blockchain Data)
export const fetchShipments = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/shipments`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching shipments:", error);
    throw error;
  }
};
