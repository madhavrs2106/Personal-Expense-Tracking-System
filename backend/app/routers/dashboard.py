from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database.db import get_db
from ..database.models import Income, Expense, Budget, User
from ..schemas.schemas import DashboardSummary
from .auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Total Income
    total_income = db.query(func.sum(Income.amount)).filter(Income.user_id == current_user.id).scalar() or 0.0
    
    # Total Expense
    total_expense = db.query(func.sum(Expense.amount)).filter(Expense.user_id == current_user.id).scalar() or 0.0

    net_savings = max(total_income - total_expense, 0.0)
    savings_rate = round((net_savings / total_income * 100), 1) if total_income > 0 else 0.0

    # Monthly Trends (Income vs Expense)
    incomes = db.query(Income).filter(Income.user_id == current_user.id).all()
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()

    trends_dict = {}
    for inc in incomes:
        m = inc.date.strftime("%b %Y")
        if m not in trends_dict:
            trends_dict[m] = {"month": m, "income": 0.0, "expense": 0.0}
        trends_dict[m]["income"] += inc.amount

    for exp in expenses:
        m = exp.date.strftime("%b %Y")
        if m not in trends_dict:
            trends_dict[m] = {"month": m, "income": 0.0, "expense": 0.0}
        trends_dict[m]["expense"] += exp.amount

    monthly_trends = list(trends_dict.values())

    # Category Distribution
    cat_query = db.query(Expense.category, func.sum(Expense.amount)).filter(
        Expense.user_id == current_user.id
    ).group_by(Expense.category).all()

    category_distribution = [
        {"category": cat, "amount": round(float(amt), 2)}
        for cat, amt in cat_query
    ]

    # Budget Progress
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    budget_status = []
    for b in budgets:
        spent = db.query(func.sum(Expense.amount)).filter(
            Expense.user_id == current_user.id,
            Expense.category == b.category
        ).scalar() or 0.0
        budget_status.append({
            "category": b.category,
            "monthly_limit": b.monthly_limit,
            "spent": spent,
            "percentage": round(min((spent / b.monthly_limit) * 100, 100.0), 1) if b.monthly_limit > 0 else 0
        })

    # Anomaly Count
    anomaly_count = db.query(Expense).filter(
        Expense.user_id == current_user.id,
        Expense.is_anomaly == True
    ).count()

    return {
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "net_savings": round(net_savings, 2),
        "savings_rate": savings_rate,
        "monthly_trends": monthly_trends,
        "category_distribution": category_distribution,
        "budget_status": budget_status,
        "anomaly_count": anomaly_count
    }
