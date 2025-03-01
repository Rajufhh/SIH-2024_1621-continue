import React, { useState, useEffect } from "react";
import { fetchShipments } from "../services/supplychainService";

const Shipments = () => {
  const [shipments, setShipments] = useState([]);

  // ✅ Fetch Shipments on Component Mount
  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      const data = await fetchShipments();
      setShipments(data);
    } catch (error) {
      console.error("❌ Error fetching shipments:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">🚚 Shipment Tracking</h2>

      {/* ✅ Shipment List */}
      <ul className="space-y-2">
        {shipments.map((shipment) => (
          <li key={shipment._id} className="border p-2 rounded flex justify-between">
            <div>
              📦 Order ID: <strong>{shipment.orderId}</strong> | 🏥 Hospital: {shipment.hospitalId} | 📍 Status: {shipment.status}
            </div>
            <span className={`px-2 py-1 rounded ${shipment.status === "Delivered" ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800"}`}>
              {shipment.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Shipments;
