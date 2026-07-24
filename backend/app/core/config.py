import os

SECRET_KEY = os.getenv("SECRET_KEY", "pets_super_secret_jwt_key_2026_finance_ai_app")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
