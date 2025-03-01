import { useState, useEffect } from "react";
import { fetchShipments, trackShipment } from "../api/supplychain";
import { Card, Input, Button } from "@/components/ui";

export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [trackingId, setTrackingId] = useState("");
  const [trackingData, setTrackingData] = useState(null);

  useEffect(() => {
    fetchShipments().then(setShipments);
  }, []);

  const handleTrackShipment = async () => {
    if (trackingId) {
      const data = await trackShipment(trackingId);
      setTrackingData(data);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Shipments</h2>
      <Input
        placeholder="Enter Shipment ID"
        value={trackingId}
        onChange={(e) => setTrackingId(e.target.value)}
      />
      <Button onClick={handleTrackShipment} className="mt-2">Track Shipment</Button>
      {trackingData && (
        <Card className="mt-2 p-2">
          <p>Status: {trackingData.status}</p>
          <p>Location: {trackingData.location}</p>
          <p>Updated At: {trackingData.updatedAt}</p>
        </Card>
      )}
      <h3 className="text-lg font-semibold mt-4">All Shipments</h3>
      {shipments.map((shipment) => (
        <Card key={shipment.id} className="mt-2 p-2">
          <p>Order ID: {shipment.orderId}</p>
          <p>Status: {shipment.status}</p>
          <p>Tracking Info: {shipment.trackingInfo}</p>
        </Card>
      ))}
    </div>
  );
}
