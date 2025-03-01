import Orders from "../components/Orders";
import Suppliers from "../components/Suppliers";
import Inventory from "../components/Inventory";
import Shipments from "../components/Shipments";

export default function SupplyChain() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Supply Chain Management</h1>
      <Orders />
      <Suppliers />
      <Inventory />
      <Shipments />
    </div>
  );
}
