from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# User Schemas
class UserRegister(BaseModel):
    full_name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# Income Schemas
class IncomeCreate(BaseModel):
    title: str
    amount: float
    category: str = "Salary"
    date: Optional[datetime] = None
    notes: Optional[str] = None

class IncomeOut(IncomeCreate):
    id: int
    user_id: int
    date: datetime

    class Config:
        from_attributes = True

# Expense Schemas
class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: Optional[str] = None
    date: Optional[datetime] = None
    notes: Optional[str] = None

class ExpenseOut(BaseModel):
    id: int
    user_id: int
    title: str
    amount: float
    category: str
    date: datetime
    notes: Optional[str] = None
    is_anomaly: bool
    anomaly_score: float

    class Config:
        from_attributes = True

# Budget Schemas
class BudgetCreate(BaseModel):
    category: str
    monthly_limit: float

class BudgetOut(BudgetCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# ML Prediction & Analytics Schemas
class PredictCategoryRequest(BaseModel):
    title: str

class PredictCategoryResponse(BaseModel):
    title: str
    predicted_category: str
    confidence: float
    top_categories: dict

class ForecastPoint(BaseModel):
    month: str
    predicted_amount: float
    lower_bound: float
    upper_bound: float

class AnomalyItem(BaseModel):
    expense_id: int
    title: str
    amount: float
    category: str
    date: datetime
    average_daily: float
    severity: str

class DashboardSummary(BaseModel):
    total_income: float
    total_expense: float
    net_savings: float
    savings_rate: float
    monthly_trends: List[dict]
    category_distribution: List[dict]
    budget_status: List[dict]
    recent_anomalies: List[dict]
