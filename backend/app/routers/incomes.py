from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database.db import get_db
from ..database.models import Income, User
from ..schemas.schemas import IncomeCreate, IncomeOut
from .auth import get_current_user

router = APIRouter(prefix="/api/incomes", tags=["Incomes"])

@router.get("", response_model=List[IncomeOut])
def get_incomes(
    search: Optional[str] = None,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Income).filter(Income.user_id == current_user.id)
    if search:
        query = query.filter(Income.title.ilike(f"%{search}%"))
    if category:
        query = query.filter(Income.category == category)
    
    return query.order_by(Income.date.desc()).all()

@router.post("", response_model=IncomeOut)
def create_income(
    income_in: IncomeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    income = Income(
        user_id=current_user.id,
        title=income_in.title,
        amount=income_in.amount,
        category=income_in.category or "Salary",
        date=income_in.date or datetime.utcnow(),
        notes=income_in.notes
    )
    db.add(income)
    db.commit()
    db.refresh(income)
    return income

@router.delete("/{income_id}")
def delete_income(
    income_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    income = db.query(Income).filter(Income.id == income_id, Income.user_id == current_user.id).first()
    if not income:
        raise HTTPException(status_code=404, detail="Income item not found")
    db.delete(income)
    db.commit()
    return {"message": "Income deleted successfully"}
