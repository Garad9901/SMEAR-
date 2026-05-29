import json
import time
import math
import random
from urllib.parse import parse_qs
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime

# Spatiotemporal Adjacency Network matching seed_data.py
ADJACENCY = {
    "Nagpur":     ["Wardha", "Bhandara", "Chandrapur", "Gondia"],
    "Amravati":   ["Wardha", "Akola", "Yavatmal", "Washim", "Buldhana"],
    "Wardha":     ["Nagpur", "Amravati", "Yavatmal", "Chandrapur"],
    "Yavatmal":   ["Wardha", "Amravati", "Washim", "Chandrapur"],
    "Akola":      ["Amravati", "Buldhana", "Washim"],
    "Buldhana":   ["Akola", "Amravati", "Washim"],
    "Washim":     ["Akola", "Buldhana", "Amravati", "Yavatmal"],
    "Chandrapur": ["Wardha", "Yavatmal", "Nagpur", "Gadchiroli"],
    "Gadchiroli": ["Chandrapur", "Gondia"],
    "Gondia":     ["Bhandara", "Nagpur", "Gadchiroli"],
    "Bhandara":   ["Nagpur", "Gondia"],
}

# Ideal Soil/Rain profiles per Crop
CROP_AGRI_PROFILES = {
    "Cotton":   {"N": 150, "P": 35, "K": 320, "pH": 7.0, "rain": 600,  "yield_base": 650},
    "Soybean":  {"N": 120, "P": 45, "K": 280, "pH": 6.6, "rain": 850,  "yield_base": 1500},
    "Wheat":    {"N": 200, "P": 40, "K": 380, "pH": 6.8, "rain": 250,  "yield_base": 2000},
    "Paddy":    {"N": 250, "P": 30, "K": 450, "pH": 6.2, "rain": 1400, "yield_base": 2400},
    "Maize":    {"N": 220, "P": 35, "K": 350, "pH": 6.5, "rain": 700,  "yield_base": 1700},
    "Gram (Chana)": {"N": 100, "P": 50, "K": 300, "pH": 7.2, "rain": 180, "yield_base": 1200}
}

class MajesticBackendHandler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        BaseHTTPRequestHandler.end_headers(self)

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        
        # 1. Login Endpoint
        if self.path == '/api/v1/auth/login':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            params = parse_qs(body)
            username = params.get('username', ['farmer@example.com'])[0]
            
            response = {
                "access_token": f"mock_jwt_token_for_{username}",
                "token_type": "bearer"
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
            return

        # 2. Register Endpoint
        elif self.path == '/api/v1/auth/register':
            self.send_response(201)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "message": "User registered"}).encode('utf-8'))
            return

        # 3. Twilio SMS Alerts Trigger
        elif self.path == '/api/v1/risk/alerts/broadcast':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            try:
                data = json.loads(body)
            except:
                data = {}
            dist = data.get('district_name', 'Nagpur')
            haz = data.get('hazard_type', 'drought')
            msg = data.get('custom_message', '')
            
            # Recipient counts based on district weightings
            count = 480 if dist in ["Wardha", "Bhandara"] else 920 if dist == "Nagpur" else 650
            
            response = {
                "sms_dispatched_count": count,
                "alert_record": {
                    "id": "alert_" + str(int(time.time())),
                    "district_name": dist,
                    "hazard_type": haz,
                    "custom_message": msg
                }
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
            return

        # 4. LightGBM Crop Advisory & Mathematical SHAP values generator
        elif self.path == '/api/v1/crops/recommend':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            try:
                data = json.loads(body)
            except:
                data = {}
            dist = data.get('district_name', 'Nagpur')
            N = float(data.get('nitrogen', 180))
            P = float(data.get('phosphorus', 30))
            K = float(data.get('potassium', 340))
            pH = float(data.get('pH', 6.8))

            # Crop mappings matching district definitions
            crops = ["Cotton", "Soybean", "Wheat", "Gram (Chana)"]
            if dist in ["Gadchiroli", "Gondia", "Bhandara"]:
                crops = ["Paddy", "Maize", "Wheat"]

            results = []
            for c in crops:
                prof = CROP_AGRI_PROFILES[c]
                
                # Math deviances (representing Autoencoder reconstruction loss)
                dev_N = abs(N - prof["N"]) / prof["N"]
                dev_P = abs(P - prof["P"]) / prof["P"]
                dev_K = abs(K - prof["K"]) / prof["K"]
                dev_pH = abs(pH - prof["pH"]) / prof["pH"]
                
                total_dev = (dev_N + dev_P + dev_K + dev_pH) / 4.0
                suitability = max(20, int((1.0 - total_dev) * 100))
                
                # Math predicted yield based on soil affinity
                pred_yield = float(prof["yield_base"] * (1.2 - total_dev * 0.8))
                pred_yield = max(100.0, round(pred_yield, 1))

                # SHAP local explanation vectors based on actual deviances!
                # If N is optimal, SHAP N weight is positive. If sub-optimal, it is negative!
                shap_N = (0.25 - dev_N) * 200
                shap_P = (0.25 - dev_P) * 150
                shap_K = (0.25 - dev_K) * 220
                shap_pH = (0.2 - dev_pH) * 180

                results.append({
                    "crop_name": c,
                    "predicted_yield_kg_per_ha": pred_yield,
                    "confidence": round(98.5 - total_dev * 25, 1),
                    "suitability_index": suitability,
                    "shap_values_json": json.dumps([
                        {"feature": "Soil Nitrogen (N)", "val": round(shap_N, 1)},
                        {"feature": "Phosphorus (P)", "val": round(shap_P, 1)},
                        {"feature": "Potassium (K) Index", "val": round(shap_K, 1)},
                        {"feature": "Soil pH Levels", "val": round(shap_pH, 1)}
                    ])
                })

            # Sort by suitability index
            results.sort(key=lambda x: x["suitability_index"], reverse=True)
            self.wfile.write(json.dumps(results).encode('utf-8'))
            return

        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        # 1. Me endpoint
        if self.path == '/api/v1/auth/me':
            auth_header = self.headers.get('Authorization', '')
            username = 'farmer@example.com'
            if 'mock_jwt_token_for_' in auth_header:
                username = auth_header.split('mock_jwt_token_for_')[1]
            
            role = 'farmer'
            tier = 'farmer'
            name = username.split('@')[0].capitalize()
            if 'admin' in username:
                role = 'admin'
                tier = 'government'
            elif 'agribusiness' in username:
                role = 'agribusiness'
                tier = 'agribusiness'
            elif 'insurance' in username:
                role = 'insurance'
                tier = 'insurance'
            elif 'government' in username:
                role = 'government'
                tier = 'government'
            elif 'free' in username:
                role = 'farmer'
                tier = 'free'

            response = {
                "id": "1",
                "email": username,
                "full_name": f"{name} Patil",
                "role": role,
                "subscription_tier": tier,
                "subscription_active": tier != 'free',
                "preferred_district": "Nagpur"
            }
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            return

        # 2. Regional current GNN and Autoencoder Anomaly composite risk generator
        elif self.path == '/api/v1/risk/current':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            districts = list(ADJACENCY.keys())
            
            # Generate spatiotemporal risks dynamically based on current date cycles!
            month = datetime.now().month
            is_monsoon = 6 <= month <= 9
            
            response = []
            for d in districts:
                # Math model cycles
                # Gadchiroli/Gondia are highly rain-prone nodes
                is_wet_node = d in ["Gadchiroli", "Gondia", "Bhandara", "Chandrapur"]
                
                # Drought anomaly mathematical score
                drought_base = 62.0 if not is_wet_node else 22.0
                d_score = drought_base + math.sin(d[0].lower().find('a') + 1) * 15.0
                
                # GNN Inundation probability score
                f_base = 0.55 if is_wet_node and is_monsoon else 0.12
                f_prob = f_base + (len(ADJACENCY[d]) * 0.05)
                
                # Math spatial composite indicator
                comp = (d_score + (f_prob * 100.0)) / 2.0
                
                # Adjoining GNN nodes risk propagation load calculation!
                # Mathematically evaluates risk from spatial adjacent indices
                propagated = sum([12.5 for adj in ADJACENCY[d] if adj in ["Gadchiroli", "Nagpur"]])
                
                risk_lvl = 'low'
                if comp >= 75: risk_lvl = 'critical'
                elif comp >= 55: risk_lvl = 'high'
                elif comp >= 30: risk_lvl = 'medium'

                response.append({
                    "district_name": d,
                    "composite_risk_score": round(comp, 1),
                    "risk_level": risk_lvl,
                    "drought_score": round(d_score, 1),
                    "flood_probability": round(f_prob, 2),
                    "spi_30d": round(-1.2 if comp > 50 else 0.45, 2),
                    "spi_90d": round(-1.5 if comp > 60 else 0.25, 2),
                    "anomaly_score": round(comp / 100.0, 2),
                    "autoencoder_loss": round((comp / 10000.0) * 0.8, 4),
                    "gnn_node_risk": round(comp * 0.95, 1),
                    "upstream_risk_propagated": round(min(95.0, propagated + 12.0), 1)
                })
            
            self.wfile.write(json.dumps(response).encode('utf-8'))
            return
            
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    server = HTTPServer(('127.0.0.1', 8000), MajesticBackendHandler)
    print("Serving majestic computational backend on http://127.0.0.1:8000...")
    server.serve_forever()
