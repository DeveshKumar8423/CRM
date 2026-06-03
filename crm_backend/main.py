from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import SessionLocal
from models import User
from schemas import LoginRequest

from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
                   "http://localhost:3001"
                   ],  # React CRA
    # allow_origins=["http://localhost:5173"], # Vite React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/login")
def login(data: LoginRequest):

    db = SessionLocal()

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid Email"
        )

    if not pwd_context.verify(
        data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid Password"
        )

    return {
        "message": "Login Success",
        "role": user.role,
        "name": user.name,
        "email": user.email
    }