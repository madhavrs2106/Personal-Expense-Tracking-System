from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database.db import get_db
from ..database.models import Expense, User
from ..schemas.schemas import PredictCategoryRequest, PredictCategoryResponse
from ..ml.ml_engine import ml_engine
from .auth import get_current_user

router = APIRouter(prefix="/api/ml", tags=["Machine Learning"])

@router.post("/predict-category", response_model=PredictCategoryResponse)
def predict_category(req: PredictCategoryRequest):
    res = ml_engine.predict_category(req.title)
    return {
        "title": req.title,
        "predicted_category": res["predicted_category"],
        "confidence": res["confidence"],
        "top_categories": res["top_categories"]
    }

@router.get("/forecast")
def get_forecast(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id).order_by(Expense.date.asc()).all()
    
    # Group by YYYY-MM
    monthly = {}
    for e in expenses:
        month_key = e.date.strftime("%Y-%m")
        monthly[month_key] = monthly.get(month_key, 0.0) + e.amount

    monthly_list = [{"month": k, "total": v} for k, v in sorted(monthly.items())]
    forecast = ml_engine.forecast_expenses(monthly_list)
    return {
        "historical": monthly_list,
        "forecast": forecast
    }

@router.get("/anomalies")
def get_anomalies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    anomalies = db.query(Expense).filter(
        Expense.user_id == current_user.id,
        Expense.is_anomaly == True
    ).order_by(Expense.date.desc()).all()

    past_expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()
    past_dicts = [{"amount": e.amount} for e in past_expenses]
    _, _, avg_daily = ml_engine.detect_anomaly(0.0, past_dicts)

    return {
        "average_daily_spending": avg_daily,
        "anomalies_count": len(anomalies),
        "items": [
            {
                "expense_id": a.id,
                "title": a.title,
                "amount": a.amount,
                "category": a.category,
                "date": a.date,
                "anomaly_score": a.anomaly_score,
                "severity": "High" if a.anomaly_score > 3.0 else "Medium"
            }
            for a in anomalies
        ]
    }
