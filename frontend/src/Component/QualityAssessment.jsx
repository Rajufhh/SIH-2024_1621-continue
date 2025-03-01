import { useState } from "react";

const QualityAssessment = () => {
  const [medicineName, setMedicineName] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [batchFile, setBatchFile] = useState(null);
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Check Medicine Standards
  const checkMedicine = async () => {
    const res = await fetch(`http://127.0.0.1:8000/check_medicine/${medicineName}`);
    const data = await res.json();
    setAiResponse(data);
  };

  // 🔹 Upload & Analyze Batch File
  const analyzeBatch = async () => {
    const formData = new FormData();
    formData.append("file", batchFile);

    const res = await fetch("http://127.0.0.1:8000/analyze_batch", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setAiResponse(data);
  };

  // 🔹 Scan Barcode from Image Upload
  const scanBarcode = async (event) => {
    const formData = new FormData();
    formData.append("file", event.target.files[0]);

    const res = await fetch("http://127.0.0.1:8000/scan_barcode", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setScanResult(data);
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold">Automated Quality Assessment</h2>

      {/* Medicine Verification */}
      <div className="mt-4">
        <label>Enter Medicine Name:</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={medicineName}
          onChange={(e) => setMedicineName(e.target.value)}
        />
        <button className="mt-2 p-2 bg-blue-500 text-white" onClick={checkMedicine}>
          Check Standards
        </button>
      </div>

      {/* Batch Analysis */}
      <div className="mt-4">
        <input type="file" onChange={(e) => setBatchFile(e.target.files[0])} />
        <button className="mt-2 p-2 bg-green-500 text-white" onClick={analyzeBatch}>
          Analyze Batch
        </button>
      </div>

      {/* Barcode Scanner */}
      <div className="mt-4">
        <input type="file" accept="image/*" onChange={scanBarcode} />
        {scanResult && <p>Scanned Data: {JSON.stringify(scanResult)}</p>}
      </div>

      {/* AI Response */}
      {aiResponse && <p className="mt-4 bg-gray-100 p-2">{JSON.stringify(aiResponse)}</p>}
    </div>
  );
};

export default QualityAssessment;
