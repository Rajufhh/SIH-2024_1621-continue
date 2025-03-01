import { useEffect, useState } from "react";

const DetailForm = () => {
  const [formData, setFormData] = useState({
    productName: "",
    subCategory: "",
    saltComposition: "",
    productManufacturer: "",
    medicineDescription: "",
    drugInteractions: "",
  });

  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // New: Store error messages

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    console.log("Updated form data:", formData);
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);
    setLoading(true);
    setAiResponse("");
    setError("");

    try {
      const res = await fetch("http://localhost:8000/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productName: formData.productName,
          medicineDescription: formData.medicineDescription,
        }),
      });

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("CORS issue detected! Make sure backend allows frontend requests.");
        }
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json().catch(() => null);

      if (!data || !data.response) {
        throw new Error("No valid AI response received.");
      }

      setAiResponse(data.response);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50 py-8">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-black mb-6 text-center">
          Medicine Detail Form
        </h2>
        <form onSubmit={handleSubmit}>
          {[
            { label: "Product Name", name: "productName", type: "text" },
            { label: "Sub Category", name: "subCategory", type: "text" },
            { label: "Salt Composition", name: "saltComposition", type: "text" },
            { label: "Product Manufacturer", name: "productManufacturer", type: "text" },
            { label: "Medicine Description", name: "medicineDescription", type: "textarea" },
            { label: "Drug Interactions", name: "drugInteractions", type: "textarea" },
          ].map(({ label, name, type }) => (
            <div className="mb-4" key={name}>
              <label className="block text-gray-700 font-semibold mb-2" htmlFor={name}>
                {label}
              </label>
              {type === "textarea" ? (
                <textarea
                  name={name}
                  id={name}
                  value={formData[name]}
                  onChange={(e) => handleInputChange(name, e.target.value)}
                  className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700"
                  required
                />
              ) : (
                <input
                  type={type}
                  name={name}
                  id={name}
                  value={formData[name]}
                  onChange={(e) => handleInputChange(name, e.target.value)}
                  className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700"
                  required
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-semibold py-2 bg-purple-500 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50 transition duration-300"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>

        {/* AI Response Section */}
        {loading && (
          <div className="mt-6 p-4 bg-yellow-100 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-700">Loading AI Response...</h3>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-100 rounded-lg">
            <h3 className="text-lg font-semibold text-red-700">Error:</h3>
            <p className="text-gray-800">{error}</p>
          </div>
        )}

        {!loading && aiResponse && (
          <div className="mt-6 p-4 bg-green-100 rounded-lg">
            <h3 className="text-lg font-semibold text-green-700">AI Response:</h3>
            <p className="text-gray-800">{aiResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailForm;
