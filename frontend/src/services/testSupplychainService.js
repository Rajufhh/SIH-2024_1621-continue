import { fetchChatbotResponse, fetchOrders, fetchSuppliers, fetchInventory, fetchShipments } from './supplychainService.js';

const testService = async () => {
  try {
    console.log("Testing fetchChatbotResponse...");
    const chatbotResponse = await fetchChatbotResponse("Hello");
    console.log("Chatbot Response:", chatbotResponse);

    console.log("Testing fetchOrders...");
    const orders = await fetchOrders();
    console.log("Orders:", orders);

    console.log("Testing fetchSuppliers...");
    const suppliers = await fetchSuppliers();
    console.log("Suppliers:", suppliers);

    console.log("Testing fetchInventory...");
    const inventory = await fetchInventory();
    console.log("Inventory:", inventory);

    console.log("Testing fetchShipments...");
    const shipments = await fetchShipments();
    console.log("Shipments:", shipments);
  } catch (error) {
    console.error("Error during testing:", error);
  }
};

testService();
