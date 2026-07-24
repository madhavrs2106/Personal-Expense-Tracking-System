from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database.db import get_db
from ..database.models import Expense, User
from ..schemas.schemas import ExpenseCreate, ExpenseOut
from ..ml.ml_engine import ml_engine
from .auth import get_current_user

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])

@router.get("", response_model=List[ExpenseOut])
def get_expenses(
    search: Optional[str] = None,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Expense).filter(Expense.user_id == current_user.id)
    if search:
        query = query.filter(Expense.title.ilike(f"%{search}%"))
    if category and category != "All":
        query = query.filter(Expense.category == category)
    
    return query.order_by(Expense.date.desc()).all()

@router.post("", response_model=ExpenseOut)
def create_expense(
    expense_in: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Auto-predict category if missing or 'Auto'
    category = expense_in.category
    if not category or category == "Auto":
        prediction = ml_engine.predict_category(expense_in.title)
        category = prediction["predicted_category"]

    # Detect Anomaly
    past_expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()
    past_dicts = [{"amount": e.amount} for e in past_expenses]
    is_anomaly, anomaly_score, _ = ml_engine.detect_anomaly(expense_in.amount, past_dicts)

    expense = Expense(
        user_id=current_user.id,
        title=expense_in.title,
        amount=expense_in.amount,
        category=category,
        date=expense_in.date or datetime.utcnow(),
        notes=expense_in.notes,
        is_anomaly=is_anomaly,
        anomaly_score=anomaly_score
    )

    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@router.put("/{expense_id}", response_model=ExpenseOut)
def update_expense(
    expense_id: int,
    expense_in: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense item not found")

    category = expense_in.category or expense.category
    if category == "Auto":
        prediction = ml_engine.predict_category(expense_in.title)
        category = prediction["predicted_category"]

    expense.title = expense_in.title
    expense.amount = expense_in.amount
    expense.category = category
    if expense_in.notes is not None:
        expense.notes = expense_in.notes
    if expense_in.date is not None:
        expense.date = expense_in.date

    db.commit()
    db.refresh(expense)
    return expense

@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense item not found")
    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted successfully"}
