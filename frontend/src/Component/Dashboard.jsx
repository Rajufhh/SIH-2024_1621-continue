import { useState } from 'react';
import { useUser, useClerk, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();
  const [activeModule, setActiveModule] = useState('overview');
  const [errorMessage, setErrorMessage] = useState(null); // Added for better error handling
  const API_BASE_URL = "http://127.0.0.1:8000"; // Updated port to 8001, no trailing slash
  const navigate = useNavigate();
  
  const userRole = user?.publicMetadata?.role || 'user';
  
  console.log('User:', user);
  console.log('User Role:', userRole);
  console.log('Public Metadata:', user?.publicMetadata);

  const handleSignOut = () => {
    signOut(() => navigate('/home'));
  };

  const canAccessModule = (moduleName) => {
    switch (moduleName) {
      case 'quality':
        return ['admin', 'manager'].includes(userRole);
      case 'compliance':
        return ['admin', 'manager'].includes(userRole);
      case 'testing':
        return ['admin', 'manager', 'tester'].includes(userRole);
      default:
        return true;
    }
  };

  const fetchWithErrorHandling = async (url, options = {}) => {
    try {
      const token = await getToken();
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
      
      console.log(`Fetching: ${url}`, options);
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log(`Response from ${url}:`, data);
      return data;
    } catch (error) {
      console.error(`Fetch error for ${url}:`, error.message);
      throw error;
    }
  };

  const verifyStandard = (medicineData) => 
    fetchWithErrorHandling(`${API_BASE_URL}/check_medicine/${encodeURIComponent(medicineData.medicine_name)}`);

  const analyzeBatch = async (data) => {
    const formData = new FormData();
    if (data.file) {
      formData.append('file', data.file);
    } else {
      const csvContent = "batch_id,dosage,supplier\n" + 
                        `${data.batch_number},${data.parameters.API_concentration},TestSupplier`;
      const blob = new Blob([csvContent], { type: 'text/csv' });
      formData.append('file', blob, 'batch_data.csv');
    }
    return fetchWithErrorHandling(`${API_BASE_URL}/analyze_batch`, { method: 'POST', body: formData });
  };

  const scanBarcode = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchWithErrorHandling(`${API_BASE_URL}/scan_barcode`, { method: 'POST', body: formData });
  };

  const scanRFID = async (rfidId) => ({
    status: 'verified',
    medicine_name: 'RFID Medicine ' + rfidId.substring(0, 5),
    batch_number: 'BT-' + Math.floor(Math.random() * 10000),
    location: 'Warehouse ' + String.fromCharCode(65 + Math.floor(Math.random() * 5))
  });

  const checkExpiry = async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    return fetchWithErrorHandling(`${API_BASE_URL}/check_expiry`, { method: 'POST', body: formData });
  };

  const approveRejectBatch = async (batchId, action) => ({
    status: 'success',
    batchId,
    action,
    timestamp: new Date().toISOString()
  });

  const verifyManufacturer = (manufacturerId) => 
    fetchWithErrorHandling(`${API_BASE_URL}/verify_manufacturer/${encodeURIComponent(manufacturerId)}`);

  const checkRecall = (batchNumber) => 
    fetchWithErrorHandling(`${API_BASE_URL}/check_recall/${encodeURIComponent(batchNumber)}`);

  const traceOrigin = (supplierHistory) => 
    fetchWithErrorHandling(`${API_BASE_URL}/trace_origin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supplier_history: supplierHistory })
    });

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-blue-800 text-white">
        <div className="p-4 font-bold text-xl">Medical Supply QA</div>
        <div className="p-4">
          <div className="text-sm">Welcome, {user?.firstName || 'User'}</div>
          <div className="text-xs mt-1 text-blue-200">Role: {userRole}</div>
        </div>
        <nav className="mt-6">
          <SidebarItem 
            title="Overview" 
            active={activeModule === 'overview'} 
            onClick={() => setActiveModule('overview')} 
          />
          <SidebarItem 
            title="Quality Assessment" 
            active={activeModule === 'quality'} 
            onClick={() => setActiveModule('quality')} 
          />
          <SidebarItem 
            title="Medicine Expiry" 
            active={activeModule === 'testing'} 
            onClick={() => setActiveModule('testing')} 
          />
          <SidebarItem 
            title="Compliance Monitoring" 
            active={activeModule === 'compliance'} 
            onClick={() => setActiveModule('compliance')} 
          />
          <SidebarItem title="Profile" onClick={() => navigate('/user-profile')} />
          <SidebarItem title="Logout" onClick={handleSignOut} />
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {activeModule === 'overview' && 'Dashboard Overview'}
            {activeModule === 'quality' && 'Quality Assessment'}
            {activeModule === 'compliance' && 'Compliance Monitoring'}
            {activeModule === 'testing' && 'Medicine Expiry Testing'}
          </h1>
          {userRole === 'admin' && (
            <button 
              onClick={() => navigate('/admin-settings')}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors duration-200"
            >
              Admin Settings
            </button>
          )}
        </header>

        <main className="p-6">
          {activeModule === 'overview' && <OverviewModule userRole={userRole} />}
          {activeModule === 'quality' && (
            <QualityAssessmentModule 
              verifyStandard={verifyStandard}
              analyzeBatch={analyzeBatch}
              scanBarcode={scanBarcode}
              scanRFID={scanRFID}
              approveRejectBatch={approveRejectBatch}
              userRole={userRole}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
            />
          )}
          {activeModule === 'compliance' && (
            <ComplianceMonitoringModule 
              verifyManufacturer={verifyManufacturer}
              checkRecall={checkRecall}
              traceOrigin={traceOrigin}
              userRole={userRole}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
            />
          )}
          {activeModule === 'testing' && (
            <AutomatedTestingModule 
              checkExpiry={checkExpiry} 
              userRole={userRole}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
            />
          )}
        </main>
      </div>
    </div>
  );
};

const OverviewModule = ({ userRole }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <MetricCard title="Quality Score" value="94%" color="green" />
    <MetricCard title="Compliance Rate" value="98%" color="blue" />
    <MetricCard title="Batch Tests" value="125" color="purple" />
    {(userRole === 'admin' || userRole === 'manager') && (
      <div className="col-span-3 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Management Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard title="Active Users" value="45" color="blue" />
          <MetricCard title="Pending Approvals" value="8" color="yellow" />
          <MetricCard title="System Health" value="99.9%" color="green" />
        </div>
      </div>
    )}
    <div className="col-span-3 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-3">
        <ActivityItem title="Batch AB123 Verified" time="2 hours ago" status="success" />
        <ActivityItem title="New Shipment Received" time="5 hours ago" status="info" />
        <ActivityItem title="Quality Check Failed" time="Yesterday" status="error" />
      </div>
    </div>
  </div>
);

const MetricCard = ({ title, value, color }) => {
  const colorClasses = {
    green: "bg-green-50 text-green-600 border-green-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    red: "bg-red-50 text-red-600 border-red-200"
  };
  return (
    <div className={`p-6 rounded-lg shadow border ${colorClasses[color]} bg-white`}>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

const ActivityItem = ({ title, time, status }) => {
  const statusClasses = {
    success: "bg-green-50 text-green-700 border-green-200",
    error: "bg-red-50 text-red-700 border-red-200",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
    info: "bg-blue-50 text-blue-700 border-blue-200"
  };
  return (
    <div className={`p-3 rounded border ${statusClasses[status]}`}>
      <div className="font-medium">{title}</div>
      <div className="text-sm opacity-75">{time}</div>
    </div>
  );
};

const QualityAssessmentModule = ({ verifyStandard, analyzeBatch, scanBarcode, scanRFID, approveRejectBatch, userRole, errorMessage, setErrorMessage }) => {
  const [selectedStandard, setSelectedStandard] = useState('ip');
  const [medicineQuery, setMedicineQuery] = useState('');
  const [batchData, setBatchData] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [batchFile, setBatchFile] = useState(null);
  const [barcodeFile, setBarcodeFile] = useState(null);

  const checkPharmacopoeialStandards = async () => {
    if (!medicineQuery) {
      setErrorMessage("Please enter a medicine name.");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await verifyStandard({ medicine_name: medicineQuery });
      setErrorMessage(`Status: ${result.status}\nMatch: ${result.match || 'N/A'}\nStandard: ${result.pharmacopoeia || 'Not found'}`);
    } catch (error) {
      setErrorMessage(`Error checking standards: ${error.message || "Failed to fetch. Ensure backend is running."}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setBatchFile(e.target.files[0]);
  };

  const handleBarcodeFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setBarcodeFile(e.target.files[0]);
  };

  const analyzeAnomalies = async () => {
    if (!batchFile) {
      setErrorMessage("Please upload a batch file.");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await analyzeBatch({ file: batchFile });
      setBatchData({
        batchId: "BTC" + Math.floor(Math.random() * 10000),
        anomalyScore: result.anomaly_percentage || 0,
        anomaliesDetected: result.anomalies_detected || 0,
        totalSamples: result.total_rows || 0,
        complianceStatus: result.anomaly_percentage < 10 ? "Compliant" : "Suspicious",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setErrorMessage(`Error analyzing batch: ${error.message || "Failed to fetch. Ensure backend is running."}`);
    } finally {
      setIsLoading(false);
    }
  };

  const scanBarcodeFunc = async () => {
    if (!barcodeFile) {
      setErrorMessage("Please upload a barcode image.");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await scanBarcode(barcodeFile);
      setScanResult({
        type: 'Barcode',
        code: result.barcode || 'Unknown',
        product: result.product || 'Unknown Product',
        manufacturer: result.manufacturer || 'Unknown Manufacturer',
        manufactureDate: result.manufacture_date || 'N/A',
        expiryDate: result.expiry_date || 'N/A',
        verified: result.verified || false,
        qrCode: result.qr_code
      });
    } catch (error) {
      setErrorMessage(`Error scanning barcode: ${error.message || "Failed to fetch. Ensure backend is running."}`);
      setScanResult({ type: 'Barcode', message: error.message || "Failed to scan" });
    } finally {
      setIsLoading(false);
    }
  };

  const scanRFIDFunc = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const rfidId = "RFID" + Math.floor(Math.random() * 1000000);
      const result = await scanRFID(rfidId);
      setScanResult({
        type: 'RFID',
        tagId: rfidId,
        product: result.medicine_name,
        manufacturer: 'Pharma Corp Ltd.',
        batchNumber: result.batch_number,
        locationHistory: [result.location],
        currentTemperature: Math.floor(Math.random() * 8) + 2 + '°C',
        verified: result.status === 'verified'
      });
    } catch (error) {
      setErrorMessage(`Error scanning RFID: ${error.message || "Failed to fetch."}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="p-4 border rounded bg-red-50 text-red-700">
          {errorMessage}
        </div>
      )}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">1. Pharmacopoeial Standards</h2>
        <p className="text-gray-600 mb-4">Cross-check medicines against standards.</p>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Select Pharmacopoeia</label>
          <select className="w-full p-2 border rounded" value={selectedStandard} onChange={(e) => setSelectedStandard(e.target.value)}>
            <option value="ip">IP</option>
            <option value="usp">USP</option>
            <option value="bp">BP</option>
            <option value="pheur">Ph. Eur.</option>
          </select>
        </div>
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <label className="block text-gray-700 text-sm font-bold mb-2">Medicine Name</label>
            <input type="text" placeholder="e.g., Paracetamol" className="w-full p-2 border rounded" value={medicineQuery} onChange={(e) => setMedicineQuery(e.target.value)} />
          </div>
          <button className="mt-8 bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300" onClick={checkPharmacopoeialStandards} disabled={isLoading || !medicineQuery}>
            {isLoading ? 'Checking...' : 'Check Standards'}
          </button>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">2. AI/ML Anomaly Detection</h2>
        <p className="text-gray-600 mb-4">Analyze batch data for anomalies.</p>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Upload Batch Data (CSV)</label>
          <input type="file" className="w-full p-2 border rounded" onChange={handleBatchFileChange} accept=".csv" />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300" onClick={analyzeAnomalies} disabled={isLoading || !batchFile}>
          {isLoading ? 'Analyzing...' : 'Analyze Anomalies'}
        </button>
        {batchData && (
          <div className="mt-4 p-4 border rounded bg-gray-50">
            <h3 className="font-medium mb-2">Analysis Results</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Batch ID:</div><div className="font-medium">{batchData.batchId}</div>
              <div>Anomaly Score:</div><div className="font-medium">{batchData.anomalyScore.toFixed(2)}%</div>
              <div>Anomalies:</div><div className="font-medium">{batchData.anomaliesDetected}/{batchData.totalSamples}</div>
              <div>Status:</div><div className="font-medium">{batchData.complianceStatus}</div>
            </div>
          </div>
        )}
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">3. Barcode & RFID Scanning</h2>
        <p className="text-gray-600 mb-4">Scan barcodes or RFID tags.</p>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Upload Barcode Image</label>
          <input type="file" className="w-full p-2 border rounded" onChange={handleBarcodeFileChange} accept="image/*" />
        </div>
        <div className="flex gap-4 mb-4">
          <button className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-green-300" onClick={scanBarcodeFunc} disabled={isLoading || !barcodeFile}>
            {isLoading && scanResult?.type === 'Barcode' ? 'Scanning...' : 'Scan Barcode'}
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded disabled:bg-purple-300" onClick={scanRFIDFunc} disabled={isLoading}>
            {isLoading && scanResult?.type === 'RFID' ? 'Scanning...' : 'Scan RFID'}
          </button>
        </div>
        {scanResult && (
          <div className="mt-4 p-4 border rounded bg-gray-50">
            <h3 className="font-medium mb-2">{scanResult.type} Scan Results</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {scanResult.type === 'Barcode' ? (
                scanResult.message ? (
                  <><div>Message:</div><div className="font-medium">{scanResult.message}</div></>
                ) : (
                  <>
                    <div>Barcode:</div><div className="font-medium">{scanResult.code}</div>
                    <div>Product:</div><div className="font-medium">{scanResult.product}</div>
                    <div>Manufacturer:</div><div className="font-medium">{scanResult.manufacturer}</div>
                    <div>Manufacture Date:</div><div className="font-medium">{scanResult.manufactureDate}</div>
                    <div>Expiry Date:</div><div className="font-medium">{scanResult.expiryDate}</div>
                    <div>Verified:</div><div className="font-medium">{scanResult.verified ? 'Yes' : 'No'}</div>
                  </>
                )
              ) : (
                <>
                  <div>RFID Tag ID:</div><div className="font-medium">{scanResult.tagId}</div>
                  <div>Product:</div><div className="font-medium">{scanResult.product}</div>
                  <div>Batch Number:</div><div className="font-medium">{scanResult.batchNumber}</div>
                  <div>Location:</div><div className="font-medium">{scanResult.locationHistory[0]}</div>
                  <div>Temperature:</div><div className="font-medium">{scanResult.currentTemperature}</div>
                </>
              )}
            </div>
            {scanResult.qrCode && <img src={scanResult.qrCode} alt="QR Code" className="mt-4 w-48 h-48" />}
          </div>
        )}
      </div>
    </div>
  );
};

const ComplianceMonitoringModule = ({ verifyManufacturer, checkRecall, traceOrigin, userRole, errorMessage, setErrorMessage }) => {
  const [manufacturerId, setManufacturerId] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [supplierHistory, setSupplierHistory] = useState([]);
  const [complianceResult, setComplianceResult] = useState(null);
  const [recallResult, setRecallResult] = useState(null);
  const [originResult, setOriginResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyManufacturer = async () => {
    if (!manufacturerId) {
      setErrorMessage("Please enter a manufacturer ID.");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await verifyManufacturer(manufacturerId);
      setComplianceResult(result);
    } catch (error) {
      setErrorMessage(`Error verifying manufacturer: ${error.message || "Failed to fetch."}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckRecall = async () => {
    if (!batchNumber) {
      setErrorMessage("Please enter a batch number.");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await checkRecall(batchNumber);
      setRecallResult(result);
    } catch (error) {
      setErrorMessage(`Error checking recall: ${error.message || "Failed to fetch."}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTraceOrigin = async () => {
    if (supplierHistory.length === 0) {
      setErrorMessage("Please add at least one supplier record.");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await traceOrigin(supplierHistory);
      setOriginResult(result);
    } catch (error) {
      setErrorMessage(`Error tracing origin: ${error.message || "Failed to fetch."}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addSupplierRecord = () => {
    setSupplierHistory([...supplierHistory, { supplier_id: '', compliance_issue: false }]);
  };

  const updateSupplierRecord = (index, field, value) => {
    const updatedHistory = [...supplierHistory];
    updatedHistory[index][field] = field === 'compliance_issue' ? value === 'true' : value;
    setSupplierHistory(updatedHistory);
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="p-4 border rounded bg-red-50 text-red-700">
          {errorMessage}
        </div>
      )}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">CDSCO/NABL Compliance</h2>
        <p className="text-gray-600 mb-4">Verify manufacturer compliance.</p>
        <div className="mb-4">
          <input 
            type="text" 
            placeholder="Manufacturer ID..." 
            className="w-full p-2 border rounded" 
            value={manufacturerId}
            onChange={(e) => setManufacturerId(e.target.value)}
          />
        </div>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300" 
          onClick={handleVerifyManufacturer}
          disabled={isLoading || !manufacturerId}
        >
          {isLoading ? 'Verifying...' : 'Verify Compliance'}
        </button>
        {complianceResult && (
          <div className="mt-4 p-4 border rounded bg-gray-50">
            <h3 className="font-medium mb-2">Compliance Result</h3>
            <div className="text-sm">
              <p>Status: <span className="font-medium">{complianceResult.status}</span></p>
              <p>Details: {JSON.stringify(complianceResult.details)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Batch & Lot Tracking</h2>
        <p className="text-gray-600 mb-4">Check batch recall status.</p>
        <div className="mb-4">
          <input 
            type="text" 
            placeholder="Batch or lot number..." 
            className="w-full p-2 border rounded" 
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
          />
        </div>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300" 
          onClick={handleCheckRecall}
          disabled={isLoading || !batchNumber}
        >
          {isLoading ? 'Checking...' : 'Check Recalls'}
        </button>
        {recallResult && (
          <div className="mt-4 p-4 border rounded bg-gray-50">
            <h3 className="font-medium mb-2">Recall Result</h3>
            <div className="text-sm">
              <p>Status: <span className="font-medium">{recallResult.status}</span></p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">AI Pattern Recognition</h2>
        <p className="text-gray-600 mb-4">Identify supplier non-compliance patterns.</p>
        <div className="mb-4">
          {supplierHistory.map((record, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Supplier ID"
                className="w-1/2 p-2 border rounded"
                value={record.supplier_id}
                onChange={(e) => updateSupplierRecord(index, 'supplier_id', e.target.value)}
              />
              <select
                className="w-1/2 p-2 border rounded"
                value={record.compliance_issue.toString()}
                onChange={(e) => updateSupplierRecord(index, 'compliance_issue', e.target.value)}
              >
                <option value="false">Compliant</option>
                <option value="true">Non-Compliant</option>
              </select>
            </div>
          ))}
          <button className="bg-gray-600 text-white px-4 py-2 rounded" onClick={addSupplierRecord}>
            Add Supplier Record
          </button>
        </div>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300" 
          onClick={handleTraceOrigin}
          disabled={isLoading || supplierHistory.length === 0}
        >
          {isLoading ? 'Tracing...' : 'Trace Origin'}
        </button>
        {originResult && (
          <div className="mt-4 p-4 border rounded bg-gray-50">
            <h3 className="font-medium mb-2">Origin Trace Result</h3>
            <div className="text-sm">
              <p>Flagged Suppliers: {originResult.flagged_suppliers.join(', ') || 'None'}</p>
              <p>Total Flagged: {originResult.total_flagged}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AutomatedTestingModule = ({ checkExpiry, userRole, errorMessage, setErrorMessage }) => {
  const [imageFile, setImageFile] = useState(null);
  const [expiryResult, setExpiryResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
  };

  const handleCheckExpiry = async () => {
    if (!imageFile) {
      setErrorMessage("Please upload an image.");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await checkExpiry(imageFile);
      setExpiryResult(result);
    } catch (error) {
      setErrorMessage(`Error checking expiry: ${error.message || "Failed to fetch. Ensure backend is running."}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="p-4 border rounded bg-red-50 text-red-700">
          {errorMessage}
        </div>
      )}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Expiry Date Check</h2>
        <p className="text-gray-600 mb-4">Upload an image to check expiry date.</p>
        <div className="mb-4">
          <input type="file" className="w-full p-2 border rounded" onChange={handleFileChange} accept="image/*" />
        </div>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300" 
          onClick={handleCheckExpiry}
          disabled={isLoading || !imageFile}
        >
          {isLoading ? 'Checking...' : 'Check Expiry'}
        </button>
        {expiryResult && (
          <div className="mt-4 p-4 border rounded bg-gray-50">
            <h3 className="font-medium mb-2">Expiry Result</h3>
            <div className="text-sm">
              <p>Status: <span className="font-medium">{expiryResult.status}</span></p>
              {expiryResult.expiry_date && <p>Expiry Date: {expiryResult.expiry_date}</p>}
              {expiryResult.message && <p>Message: {expiryResult.message}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SidebarItem = ({ title, active, onClick }) => (
  <div className={`px-4 py-2 cursor-pointer ${active ? 'bg-blue-900' : 'hover:bg-blue-700'}`} onClick={onClick}>
    {title}
  </div>
);

export default Dashboard;