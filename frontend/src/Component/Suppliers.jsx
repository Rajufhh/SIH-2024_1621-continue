import { useState, useEffect } from "react";
import { fetchSuppliers } from "../api/supplychain";
import { Card } from "@/components/ui";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetchSuppliers().then(setSuppliers);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Suppliers</h2>
      {suppliers.map((supplier) => (
        <Card key={supplier.id} className="mt-2 p-2">
          <p>Name: {supplier.name}</p>
          <p>Rating: {supplier.rating} ⭐</p>
          <p>Contact: {supplier.contact}</p>
        </Card>
      ))}
    </div>
  );
}
