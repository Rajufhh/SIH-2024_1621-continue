import React, { useState, useEffect } from "react";
import { fetchSuppliers } from "../services/supplychainService";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);

  // ✅ Fetch Suppliers on Component Mount
  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const data = await fetchSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error("❌ Error fetching suppliers:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">🏆 Suppliers</h2>

      {/* ✅ Supplier List */}
      <ul className="space-y-2">
        {suppliers.map((supplier) => (
          <li key={supplier._id} className="border p-2 rounded flex justify-between">
            <div>
              🏢 <strong>{supplier.name}</strong> | 📍 Location: {supplier.location} | ☎ Contact: {supplier.contact}
            </div>
            <span className="bg-green-200 text-green-800 px-2 py-1 rounded">⭐ {supplier.rating}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Suppliers;
