import React, { useState, useEffect } from "react";
import { fetchOrders, createOrder } from "../services/supplychainService";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [newOrder, setNewOrder] = useState({ hospitalId: "", medicineId: "", quantity: 1 });

  // ✅ Fetch Orders on Component Mount
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
    }
  };

  // ✅ Handle Input Change
  const handleChange = (e) => {
    setNewOrder({ ...newOrder, [e.target.name]: e.target.value });
  };

  // ✅ Place New Order
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    try {
      await createOrder(newOrder);
      alert("✅ Order placed successfully!");
      loadOrders(); // Reload Orders
    } catch (error) {
      alert("❌ Failed to place order");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📦 Orders</h2>

      {/* ✅ Order Form */}
      <form onSubmit={handleOrderSubmit} className="mb-6 space-y-2">
        <input type="text" name="hospitalId" placeholder="Hospital ID" value={newOrder.hospitalId} onChange={handleChange} className="border p-2 w-full"/>
        <input type="text" name="medicineId" placeholder="Medicine ID" value={newOrder.medicineId} onChange={handleChange} className="border p-2 w-full"/>
        <input type="number" name="quantity" placeholder="Quantity" value={newOrder.quantity} onChange={handleChange} className="border p-2 w-full"/>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">➕ Place Order</button>
      </form>

      {/* ✅ Order List */}
      <h3 className="text-xl font-bold mb-2">📋 Order List</h3>
      <ul className="space-y-2">
        {orders.map((order) => (
          <li key={order._id} className="border p-2 rounded">
            🏥 Hospital: {order.hospitalId} | 💊 Medicine: {order.medicineId} | 📦 Quantity: {order.quantity} | 🏷 Status: {order.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Order;
