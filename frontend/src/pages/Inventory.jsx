import React, { useState, useEffect } from "react";
import { fetchInventory } from "../services/supplychainService";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);

  // ✅ Fetch Inventory on Component Mount
  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const data = await fetchInventory();
      setInventory(data);
    } catch (error) {
      console.error("❌ Error fetching inventory:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📊 Inventory</h2>

      {/* ✅ Inventory List */}
      <ul className="space-y-2">
        {inventory.map((item) => (
          <li key={item._id} className="border p-2 rounded flex justify-between">
            <div>
              💊 <strong>{item.medicineName}</strong> | 🏥 Hospital: {item.hospitalId} | 📦 Quantity: {item.stock}
            </div>
            <span className={`px-2 py-1 rounded ${item.stock > 10 ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
              {item.stock > 10 ? "✅ In Stock" : "⚠ Low Stock"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Inventory;
