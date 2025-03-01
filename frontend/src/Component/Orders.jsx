import { useState, useEffect } from "react";
import { fetchOrders, createOrder, predictDemand } from "../api/supplychain";
import { Button, Card, Input } from "@/components/ui";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [hospitalId, setHospitalId] = useState("");
  const [medicineId, setMedicineId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [predictedDemand, setPredictedDemand] = useState(null);

  useEffect(() => {
    fetchOrders().then(setOrders);
  }, []);

  const handlePredict = async () => {
    const demand = await predictDemand(hospitalId, medicineId);
    setPredictedDemand(demand);
  };

  const handleCreateOrder = async () => {
    const newOrder = await createOrder({ hospitalId, medicineId, quantity });
    setOrders([...orders, newOrder]);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Orders</h2>
      <Card>
        <Input
          placeholder="Hospital ID"
          value={hospitalId}
          onChange={(e) => setHospitalId(e.target.value)}
        />
        <Input
          placeholder="Medicine ID"
          value={medicineId}
          onChange={(e) => setMedicineId(e.target.value)}
        />
        <Input
          placeholder="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <Button onClick={handlePredict} className="mt-2">Predict Demand</Button>
        {predictedDemand && <p>Predicted Demand: {predictedDemand}</p>}
        <Button onClick={handleCreateOrder} className="mt-2">Place Order</Button>
      </Card>
      <h3 className="text-lg font-semibold mt-4">Order List</h3>
      {orders.map((order) => (
        <Card key={order.id} className="mt-2 p-2">
          <p>Hospital: {order.hospitalId}</p>
          <p>Medicine: {order.medicineId}</p>
          <p>Quantity: {order.quantity}</p>
          <p>Status: {order.status}</p>
        </Card>
      ))}
    </div>
  );
}
