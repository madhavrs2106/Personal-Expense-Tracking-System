import os
import sys
from datetime import datetime, timedelta
import random

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.db import SessionLocal, engine, Base
from app.database.models import User, Income, Expense, Budget, Category
from app.core.security import get_password_hash
from app.ml.ml_engine import ml_engine

def seed_database():
    print("[PETS Seed] Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if demo user exists
    user = db.query(User).filter(User.email == "demo@pets.com").first()
    if not user:
        user = User(
            full_name="Madhav Shukla",
            email="demo@pets.com",
            hashed_password=get_password_hash("password123")
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"[PETS Seed] Created Demo User: demo@pets.com (password: password123)")
    else:
        print("[PETS Seed] Demo User already exists.")

    # Budgets setup
    existing_budgets = db.query(Budget).filter(Budget.user_id == user.id).all()
    if not existing_budgets:
        budgets = [
            Budget(user_id=user.id, category="Food & Dining", monthly_limit=15000),
            Budget(user_id=user.id, category="Transportation", monthly_limit=8000),
            Budget(user_id=user.id, category="Shopping", monthly_limit=12000),
            Budget(user_id=user.id, category="Entertainment", monthly_limit=5000),
            Budget(user_id=user.id, category="Utilities", monthly_limit=6000),
            Budget(user_id=user.id, category="Housing", monthly_limit=25000),
        ]
        db.add_all(budgets)
        db.commit()
        print("[PETS Seed] Category budgets created.")

    # Populate Incomes over the past 6 months
    existing_incomes = db.query(Income).filter(Income.user_id == user.id).count()
    if existing_incomes == 0:
        now = datetime.utcnow()
        incomes = []
        for month_offset in range(6, -1, -1):
            date_salary = now - timedelta(days=month_offset * 30 - 2)
            date_freelance = now - timedelta(days=month_offset * 30 - 15)
            
            incomes.append(Income(
                user_id=user.id,
                title="Monthly Software Engineer Salary",
                amount=85000.0,
                category="Salary",
                date=date_salary,
                notes="Direct deposit bank transfer"
            ))
            
            if month_offset % 2 == 0:
                incomes.append(Income(
                    user_id=user.id,
                    title="Freelance Web Development Project",
                    amount=18000.0,
                    category="Freelance",
                    date=date_freelance,
                    notes="Client payout"
                ))
        db.add_all(incomes)
        db.commit()
        print(f"[PETS Seed] Created {len(incomes)} historical income records.")

    # Populate Expenses over past 6 months
    existing_expenses = db.query(Expense).filter(Expense.user_id == user.id).count()
    if existing_expenses == 0:
        sample_transactions = [
            ("Starbucks Coffee Latte", 350.0, "Food & Dining"),
            ("Uber Ride to Office", 420.0, "Transportation"),
            ("Netflix 4K Monthly Subscription", 649.0, "Entertainment"),
            ("Swiggy Dinner Order", 780.0, "Food & Dining"),
            ("Amazon Electronics & Accessories", 2499.0, "Shopping"),
            ("Electricity Utility Bill Payment", 3200.0, "Utilities"),
            ("Airtel Fiber Wifi Bill", 1179.0, "Utilities"),
            ("House Monthly Rent", 22000.0, "Housing"),
            ("Supermarket Monthly Groceries", 6500.0, "Groceries"),
            ("Pharmacy Medicine Purchase", 890.0, "Healthcare"),
            ("Gym Annual Fitness Membership", 12000.0, "Personal Care"),
            ("Zomato Gourmet Lunch", 950.0, "Food & Dining"),
            ("Petrol Refill for Car", 2500.0, "Transportation"),
            ("Zara Apparel Purchase", 4990.0, "Shopping"),
            ("Bookstore Tech Books", 1450.0, "Education"),
            ("Cinema IMAX Movie Tickets", 900.0, "Entertainment"),
            # Anomaly trigger items
            ("Luxury Hotel Weekend Staycation", 18500.0, "Entertainment"),
            ("High-End Designer Camera Equipment", 42000.0, "Shopping"),
        ]

        now = datetime.utcnow()
        expenses = []
        for month_offset in range(6, -1, -1):
            num_txs = random.randint(8, 14)
            for _ in range(num_txs):
                title, base_amt, cat = random.choice(sample_transactions)
                # Randomize amount slightly
                amt = round(base_amt * random.uniform(0.85, 1.25), 2)
                day_offset = random.randint(1, 28)
                tx_date = now - timedelta(days=month_offset * 30 + day_offset)
                
                # Check anomaly status
                is_anom = amt > 15000.0
                score = round(amt / 4500.0, 2) if is_anom else 0.0

                expenses.append(Expense(
                    user_id=user.id,
                    title=title,
                    amount=amt,
                    category=cat,
                    date=tx_date,
                    notes=f"Auto-generated seed transaction",
                    is_anomaly=is_anom,
                    anomaly_score=score
                ))

        db.add_all(expenses)
        db.commit()
        print(f"[PETS Seed] Created {len(expenses)} historical expense records.")

    print("[PETS Seed] Data seeding completed successfully.")

if __name__ == "__main__":
    seed_database()
