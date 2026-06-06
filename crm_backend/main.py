from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.admin_router import router as admin_router
from routers.auth_router import router as auth_router
from routers.company_router import router as company_router
from routers.contacts_router import router as contacts_router
from routers.products_router import router as products_router

app = FastAPI(title="CRM API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(company_router)
app.include_router(contacts_router)
app.include_router(products_router)
