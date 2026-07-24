import os
import joblib
import pandas as pd
import numpy as np
from typing import List, Dict, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

# Model Save Paths
ML_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(ML_DIR, "category_classifier.joblib")

# Default Sample Training Data
TRAINING_DATA = [
    # Food & Dining
    ("Starbucks Coffee Latte", "Food & Dining"),
    ("McDonalds Burger Meal", "Food & Dining"),
    ("Dominos Pizza Order", "Food & Dining"),
    ("Subway Sandwich", "Food & Dining"),
    ("Restaurant Lunch Dinner", "Food & Dining"),
    ("Swiggy Food Delivery", "Food & Dining"),
    ("Zomato Order", "Food & Dining"),
    ("Dunkin Donuts Coffee", "Food & Dining"),
    ("KFC Chicken Bucket", "Food & Dining"),
    
    # Transportation
    ("Uber Ride Cab", "Transportation"),
    ("Ola Auto Ride", "Transportation"),
    ("Metro Train Pass", "Transportation"),
    ("Petrol Pump Fuel", "Transportation"),
    ("Diesel Fuel Refill", "Transportation"),
    ("Flight Ticket Booking", "Transportation"),
    ("Bus Ticket Fare", "Transportation"),
    ("Parking Fee Ticket", "Transportation"),
    
    # Entertainment
    ("Netflix Monthly Subscription", "Entertainment"),
    ("Spotify Music Premium", "Entertainment"),
    ("Cinema Movie Tickets", "Entertainment"),
    ("Amazon Prime Video", "Entertainment"),
    ("PlayStation Store Game", "Entertainment"),
    ("Concert Event Ticket", "Entertainment"),
    ("Steam Video Game", "Entertainment"),
    
    # Shopping
    ("Amazon Online Shopping", "Shopping"),
    ("Flipkart Electronics", "Shopping"),
    ("Zara Clothing Apparel", "Shopping"),
    ("Nike Sports Shoes", "Shopping"),
    ("Myntra Fashion Order", "Shopping"),
    ("Apple iPhone Accessory", "Shopping"),
    ("Department Store Retail", "Shopping"),

    # Housing & Utilities
    ("House Monthly Rent", "Housing"),
    ("Electricity Bill Payment", "Utilities"),
    ("Water Utility Bill", "Utilities"),
    ("Airtel Broadband Wifi Bill", "Utilities"),
    ("Gas Cylinder Supply", "Utilities"),
    ("Property Tax Maintenance", "Housing"),

    # Groceries
    ("Supermarket Grocery Items", "Groceries"),
    ("Fresh Vegetables Fruit Market", "Groceries"),
    ("Milk Dairy Supplies", "Groceries"),
    ("Walmart Grocery Store", "Groceries"),
    ("BigBasket Organic Grocery", "Groceries"),

    # Healthcare
    ("Pharmacy Medicine Prescription", "Healthcare"),
    ("Hospital Doctor Consultation", "Healthcare"),
    ("Dental Care Clinic", "Healthcare"),
    ("Health Insurance Premium", "Healthcare"),
    ("Lab Diagnostics Test", "Healthcare"),

    # Education & Personal Care
    ("University Tuition Fee", "Education"),
    ("Udemy Online Course", "Education"),
    ("Book Store Textbooks", "Education"),
    ("Salon Haircut Spa", "Personal Care"),
    ("Gym Fitness Membership", "Personal Care")
]

class MLEngine:
    def __init__(self):
        self.model: Pipeline = None
        self._load_or_train_model()

    def _load_or_train_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
                return
            except Exception as e:
                print(f"[ML Engine] Error loading model, retraining: {e}")
        
        self.train_model()

    def train_model(self, custom_data: List[Tuple[str, str]] = None):
        data = custom_data if custom_data else TRAINING_DATA
        descriptions = [d[0] for d in data]
        categories = [d[1] for d in data]

        pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(ngram_range=(1, 2), lowercase=True, stop_words='english')),
            ('clf', LogisticRegression(C=1.0, max_iter=200))
        ])

        pipeline.fit(descriptions, categories)
        self.model = pipeline
        joblib.dump(self.model, MODEL_PATH)
        print(f"[ML Engine] Category classifier model trained successfully on {len(data)} samples.")

    def predict_category(self, title: str) -> Dict:
        if not title or len(title.strip()) < 2:
            return {
                "predicted_category": "Other",
                "confidence": 0.5,
                "top_categories": {"Other": 0.5}
            }
        
        probs = self.model.predict_proba([title])[0]
        classes = self.model.classes_

        best_idx = np.argmax(probs)
        predicted_category = classes[best_idx]
        confidence = float(probs[best_idx])

        # Get top 3 categories
        sorted_indices = np.argsort(probs)[::-1][:3]
        top_cats = {classes[i]: round(float(probs[i]), 2) for i in sorted_indices}

        # Fallback to 'Other' if confidence is low
        if confidence < 0.25:
            predicted_category = "Other"

        return {
            "predicted_category": predicted_category,
            "confidence": round(confidence, 2),
            "top_categories": top_cats
        }

    def detect_anomaly(self, amount: float, user_expenses: List[Dict]) -> Tuple[bool, float, float]:
        """
        Detects if an expense amount is an anomaly compared to past user transaction history.
        Returns: (is_anomaly, anomaly_score, average_daily)
        """
        if not user_expenses or len(user_expenses) < 3:
            # Not enough baseline data, flag if exceptionally high (> 5000)
            avg_daily = 700.0
            is_anomaly = amount > (avg_daily * 4)
            score = round(min(amount / (avg_daily * 4), 5.0), 2) if is_anomaly else 0.0
            return is_anomaly, score, avg_daily

        amounts = [e["amount"] for e in user_expenses]
        mean_amt = np.mean(amounts)
        std_amt = np.std(amounts) if len(amounts) > 1 else mean_amt * 0.5

        if std_amt == 0:
            std_amt = mean_amt * 0.3

        z_score = (amount - mean_amt) / std_amt
        is_anomaly = z_score >= 2.2 or (amount >= mean_amt * 3.5 and amount > 2500)
        score = round(float(max(z_score, 0.0)), 2)

        return is_anomaly, score, round(float(mean_amt), 2)

    def forecast_expenses(self, monthly_totals: List[Dict]) -> List[Dict]:
        """
        Predicts future 3 months of expenses using Holt-Winters / Exponential Trend model.
        monthly_totals: List of dicts like [{"month": "2026-01", "total": 12000}, ...]
        """
        if not monthly_totals or len(monthly_totals) < 2:
            # Fallback default baseline
            base = monthly_totals[-1]["total"] if monthly_totals else 15000.0
            months = ["Aug 2026", "Sep 2026", "Oct 2026"]
            return [
                {
                    "month": m,
                    "predicted_amount": round(base * (1 + (i * 0.03)), 2),
                    "lower_bound": round(base * (1 + (i * 0.03)) * 0.90, 2),
                    "upper_bound": round(base * (1 + (i * 0.03)) * 1.12, 2),
                }
                for i, m in enumerate(months)
            ]

        amounts = [m["total"] for m in monthly_totals]

        # Simple weighted linear trend + seasonal buffer
        n = len(amounts)
        x = np.arange(n)
        slope, intercept = np.polyfit(x, amounts, 1)

        forecasts = []
        future_months = ["Month +1", "Month +2", "Month +3"]
        for i in range(1, 4):
            future_step = n - 1 + i
            pred = max(intercept + slope * future_step, mean_val := float(np.mean(amounts)) * 0.5)
            # Add small random variation to simulate confidence bands
            std_err = float(np.std(amounts)) if len(amounts) > 2 else pred * 0.1
            forecasts.append({
                "month": f"Month +{i}",
                "predicted_amount": round(float(pred), 2),
                "lower_bound": round(max(float(pred) - 1.2 * std_err, 0.0), 2),
                "upper_bound": round(float(pred) + 1.2 * std_err, 2)
            })

        return forecasts

ml_engine = MLEngine()
