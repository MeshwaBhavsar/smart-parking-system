
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import os

from app.database import engine
from app import models
from routers import auth, user, contact, parking, profile,admin,qr,owner_appli,websocket,staff,pay,admin_dashboard,admin_parking
from routers import reservation,owner_reservation,admin_reservation,owner_payment,owner_parking,vehical,admin_payment,email,analytics



models.Base.metadata.create_all(bind=engine)

app = FastAPI()


# ---------------- Upload Folder ----------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

os.makedirs(os.path.join(UPLOAD_DIR, "profile"), exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_DIR),
    name="uploads"
)

app.mount(
    "/static",
    StaticFiles(
        directory="static"
    ),
    name="static"
)


# ---------------- CORS ----------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Routers ----------------

app.include_router(auth.router)
app.include_router(user.router)
app.include_router(contact.router)
app.include_router(parking.router)
app.include_router(profile.router)
app.include_router(reservation.router)
app.include_router(admin.router)
app.include_router(qr.router)
app.include_router(pay.router)
app.include_router(owner_parking.router)
app.include_router(owner_appli.router)
app.include_router(owner_reservation.router)
app.include_router(owner_payment.router)
app.include_router(admin_reservation.router)
app.include_router(admin_dashboard.router)
app.include_router(admin_payment.router)
app.include_router(admin_parking.router)
app.include_router(email.router)
app.include_router(vehical.router)
app.include_router(staff.router)
app.include_router(websocket.router)
app.include_router(analytics.router)






# @app.get("/")
# def home():
#     return {
#         "message": "Backend Running"
#     }

@app.get("/")
def home():
    return {"message": "smart parking "}


