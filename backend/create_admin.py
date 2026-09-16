from app.database import SessionLocal
from app.models import Admin
from app.util import hash_password


db = SessionLocal()

email = "heer@gmail.com"
password = "admin123"


# Check if admin already exists
admin = db.query(Admin).filter(
    Admin.email == email
).first()


if admin:

    # Update existing admin
    admin.password = hash_password(password)
    admin.is_active = True

    db.commit()

    print("Admin password updated successfully")

else:

    # Create new admin
    admin = Admin(
        full_name="Smart Parking Admin",
        email=email,
        password=hash_password(password),
        is_active=True
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    print("Admin created successfully")


db.close()