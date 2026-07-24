from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.db import engine, Base
from app.routers import auth, incomes, expenses, ml_router, dashboard

# Create Database Tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Personal Expense Tracking System (PETS) API",
    description="AI-Powered Full-Stack Personal Finance Management REST API with ML Auto-categorization, Forecasting, & Anomaly Detection",
    version="1.1.0"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(incomes.router)
app.include_router(expenses.router)
app.include_router(ml_router.router)
app.include_router(dashboard.router)

@app.get("/")
def read_root():
    return {
        "system": "Personal Expense Tracking System (PETS)",
        "status": "Online",
        "version": "1.1.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
