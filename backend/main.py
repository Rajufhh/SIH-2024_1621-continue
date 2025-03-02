# python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

import os
import google.generativeai as genai
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from fuzzywuzzy import process
import pandas as pd
import cv2
import numpy as np
from pyzbar.pyzbar import decode
from fastapi.middleware.cors import CORSMiddleware
import pytesseract
import re
from datetime import datetime
import requests
import qrcode
from io import BytesIO
import base64
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5176"],  # Explicitly allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/gemini")
async def gemini(request: dict):
    try:
        message = request.get("message")
        history = request.get("history", [])
        # Use Google Gemini AI
        model = genai.GenerativeModel('gemini-pro')
        chat = model.start_chat(history=history)
        response = await chat.send_message(message)
        return {"response": response.text}
    except Exception as e:
        logger.error(f"Error in /gemini: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Configure Google Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_API_KEY_HERE")  # Use env var or replace with actual key
if not GEMINI_API_KEY or GEMINI_API_KEY == "AIzaSyCJJlf8VINkOWCLpQDt7DROpyCdpTG8Um0":
    logger.warning("GEMINI_API_KEY is missing or not set. Using mock mode.")
genai.configure(api_key=GEMINI_API_KEY)

# Sample Pharmacopoeia Databas
PHARMACOPOEIA_DB = {
    "Paracetamol": "IP/USP/BP - 500mg Tablet",
    "Ibuprofen": "BP/USP - 400mg Tablet",
    "Amoxicillin": "Ph. Eur. - 250mg Capsule",
    "Azithromycin": "USP - 500mg Tablet",
    "Ciprofloxacin": "IP/USP - 500mg Tablet",
    "Doxycycline": "BP - 100mg Capsule",
    "Metronidazole": "IP/USP - 400mg Tablet",
    "Aspirin": "BP/USP - 325mg Tablet",
    "Diclofenac": "IP/USP - 50mg Tablet",
    "Naproxen": "USP - 500mg Tablet",
    "Cetirizine": "IP/USP - 10mg Tablet",
    "Loratadine": "BP/USP - 10mg Tablet",
    "Fexofenadine": "USP - 120mg Tablet",
    "Ranitidine": "Ph. Eur. - 150mg Tablet",
    "Omeprazole": "IP/USP/BP - 20mg Capsule",
    "Pantoprazole": "BP/USP - 40mg Tablet",
    "Esomeprazole": "Ph. Eur. - 40mg Capsule",
    "Atorvastatin": "USP - 10mg Tablet",
    "Simvastatin": "BP/USP - 20mg Tablet",
    "Rosuvastatin": "Ph. Eur. - 10mg Tablet",
    "Amlodipine": "IP/USP - 5mg Tablet",
    "Metformin": "IP/USP/BP - 500mg Tablet",
    "Glimepiride": "BP/USP - 2mg Tablet",
    "Losartan": "IP/USP - 50mg Tablet",
    "Telmisartan": "BP/USP - 40mg Tablet",
    "Ramipril": "Ph. Eur. - 5mg Capsule",
}

# ComplianceChecker Class (mocked for simplicity)
class ComplianceChecker:
    def __init__(self, cdsco_api, nabl_api, recall_api):
        self.cdsco_api = cdsco_api
        self.nabl_api = nabl_api
        self.recall_api = recall_api
    
    def verify_manufacturer(self, manufacturer_id):
        logger.info(f"Verifying manufacturer: {manufacturer_id}")
        return {"status": "Compliant", "details": {"manufacturer_id": manufacturer_id, "name": "MockPharma", "compliant": True, "certified": True}}
    
    def check_recall(self, batch_number):
        logger.info(f"Checking recall for batch: {batch_number}")
        return {"status": "Clear"}
    
    def trace_origin(self, supplier_history):
        logger.info(f"Tracing origin with history: {supplier_history}")
        non_compliance_patterns = {}
        for record in supplier_history:
            supplier_id = record["supplier_id"]
            if record.get("compliance_issue"):
                non_compliance_patterns[supplier_id] = non_compliance_patterns.get(supplier_id, 0) + 1
        flagged_suppliers = [s for s, count in non_compliance_patterns.items() if count > 2]
        return {"flagged_suppliers": flagged_suppliers, "total_flagged": len(flagged_suppliers)}

checker = ComplianceChecker("https://api.cdsco.gov.in", "https://api.nabl.gov.in", "https://api.recalls.gov.in")

@app.get("/check_medicine/{medicine_name}")
async def check_medicine(medicine_name: str):
    logger.info(f"Checking medicine: {medicine_name}")
    try:
        best_match, score = process.extractOne(medicine_name, PHARMACOPOEIA_DB.keys())
        if score > 80:
            return {"status": "Valid", "match": best_match, "pharmacopoeia": PHARMACOPOEIA_DB[best_match]}
        return {"status": "Invalid", "message": "Medicine does not match official standards"}
    except Exception as e:
        logger.error(f"Error in check_medicine: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze_batch")
async def analyze_batch(file: UploadFile = File(...)):
    logger.info(f"Analyzing batch file: {file.filename}")
    try:
        df = pd.read_csv(file.file)
        if "dosage" not in df.columns:
            raise ValueError("Missing 'dosage' column in uploaded file.")
        std_dev = df["dosage"].std()
        anomalies = df[df["dosage"] > (df["dosage"].mean() + 2 * std_dev)]
        return {
            "status": "Processed",
            "total_rows": len(df),
            "anomalies_detected": len(anomalies),
            "anomaly_percentage": (len(anomalies) / len(df)) * 100,
        }
    except Exception as e:
        logger.error(f"Error in analyze_batch: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def get_real_product_details(barcode):
    logger.info(f"Fetching real product details for barcode: {barcode}")
    try:
        api_url = f"https://api.fda.gov/drug/ndc.json?search=package_ndc:{barcode}"
        response = requests.get(api_url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if "results" in data and len(data["results"]) > 0:
                result = data["results"][0]
                return {
                    "product": result.get("brand_name", "Unknown"),
                    "manufacturer": result.get("manufacturer_name", "Unknown"),
                    "manufacture_date": "N/A",
                    "expiry_date": "N/A",
                    "verified": True
                }
        return None
    except Exception as e:
        logger.error(f"Error fetching product details: {str(e)}")
        return None

@app.post("/scan_barcode")
async def scan_barcode(file: UploadFile = File(...)):
    logger.info(f"Scanning barcode file: {file.filename}")
    try:
        img = np.frombuffer(file.file.read(), np.uint8)
        img = cv2.imdecode(img, cv2.IMREAD_COLOR)
        barcodes = decode(img)
        
        if not barcodes:
            result = {
                "status": "Failed",
                "message": "No barcode detected",
                "barcode": "Unknown",
                "product": "Unknown Product",
                "manufacturer": "Unknown Manufacturer",
                "manufacture_date": "N/A",
                "expiry_date": "N/A",
                "verified": False
            }
        else:
            barcode_data = barcodes[0].data.decode("utf-8")
            details = get_real_product_details(barcode_data)
            if details:
                result = {
                    "status": "Success",
                    "barcode": barcode_data,
                    "product": details["product"],
                    "manufacturer": details["manufacturer"],
                    "manufacture_date": details["manufacture_date"],
                    "expiry_date": details["expiry_date"],
                    "verified": details["verified"]
                }
            else:
                result = {
                    "status": "Failed",
                    "message": "Product not found in official database",
                    "barcode": barcode_data,
                    "product": "Unknown Product",
                    "manufacturer": "Unknown Manufacturer",
                    "manufacture_date": "N/A",
                    "expiry_date": "N/A",
                    "verified": False
                }

        qr_text = f"""Barcode Scan Results
Status: {result["status"]}
Barcode: {result["barcode"]}
Product: {result["product"]}
Manufacturer: {result["manufacturer"]}
Manufacture Date: {result["manufacture_date"]}
Expiry Date: {result["expiry_date"]}
Verified: {str(result["verified"])}"""
        qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=10, border=4)
        qr.add_data(qr_text)
        qr.make(fit=True)
        qr_img = qr.make_image(fill="black", back_color="white")
        buffer = BytesIO()
        qr_img.save(buffer, format="PNG")
        qr_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
        buffer.close()
        result["qr_code"] = f"data:image/png;base64,{qr_base64}"
        return result
    except Exception as e:
        logger.error(f"Error in scan_barcode: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def preprocess_image(image_bytes):
    logger.info("Preprocessing image for expiry check")
    try:
        image = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        gray = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 2)
        gray = cv2.fastNlMeansDenoising(gray, h=30)
        return gray
    except Exception as e:
        logger.error(f"Error in preprocess_image: {str(e)}")
        raise

def extract_expiry_date(image_bytes):
    logger.info("Extracting expiry date")
    try:
        processed_image = preprocess_image(image_bytes)
        custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789/'
        extracted_text = pytesseract.image_to_string(processed_image, config=custom_config)
        logger.info(f"Extracted Text: {extracted_text}")
        expiry_patterns = [r'\b(0[1-9]|1[0-2])[/\\]([0-9]{2,4})\b']
        for pattern in expiry_patterns:
            matches = re.findall(pattern, extracted_text)
            if matches:
                month, year = matches[0]
                year = "20" + year if len(year) == 2 else year
                return f"{month}/{year}"
        return None
    except Exception as e:
        logger.error(f"Error in extract_expiry_date: {str(e)}")
        raise

def validate_medicine_quality(image_bytes):
    expiry_date = extract_expiry_date(image_bytes)
    if not expiry_date:
        return {"status": "Not Found", "message": "Expiry date not detected. Try a clearer image."}
    expiry_datetime = datetime.strptime(expiry_date, "%m/%Y")
    current_datetime = datetime.now()
    if expiry_datetime < current_datetime:
        return {"status": "Expired", "expiry_date": expiry_date}
    return {"status": "Valid", "expiry_date": expiry_date}

@app.post("/check_expiry")
async def check_expiry(file: UploadFile = File(...)):
    logger.info(f"Checking expiry for file: {file.filename}")
    try:
        image_bytes = await file.read()
        result = validate_medicine_quality(image_bytes)
        return result
    except Exception as e:
        logger.error(f"Error in check_expiry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/verify_manufacturer/{manufacturer_id}")
async def verify_manufacturer(manufacturer_id: str):
    return checker.verify_manufacturer(manufacturer_id)

@app.get("/check_recall/{batch_number}")
async def check_recall(batch_number: str):
    return checker.check_recall(batch_number)

class SupplierHistory(BaseModel):
    supplier_history: list

@app.post("/trace_origin")
async def trace_origin(data: SupplierHistory):
    return checker.trace_origin(data.supplier_history)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)