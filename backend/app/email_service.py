import os

from dotenv import load_dotenv
from email.message import EmailMessage

import aiosmtplib


from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM = os.getenv("SMTP_FROM")



# SMTP_EMAIL = os.getenv("SMTP_EMAIL")
# SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")


async def send_owner_application_email(
    owner_email: str,
    owner_name: str,
    status: str
):

    message = EmailMessage()

    message["From"] = SMTP_FROM
    message["To"] = owner_email

    if status == "APPROVED":

        message["Subject"] = "Parking Owner Application Approved"

        message.set_content(
            f"""
Hello {owner_name},

Congratulations!

Your parking owner application has been approved by the admin.

Application Status: APPROVED

You can now log in to the Smart Car Parking System
using your registered email address.

Regards,
Smart Car Parking System
"""
        )

    elif status == "REJECTED":

        message["Subject"] = "Parking Owner Application Rejected"

        message.set_content(
            f"""
Hello {owner_name},

Your parking owner application has been rejected by the admin.

Application Status: REJECTED

If you believe this was a mistake, please contact the administrator.

Regards,
Smart Car Parking System
"""
        )

    else:

        message["Subject"] = "Parking Owner Application Status"

        message.set_content(
            f"""
Hello {owner_name},

Your parking owner application status is:

{status}

Regards,
Smart Car Parking System
"""
        )

    await aiosmtplib.send(
        message,
        hostname=SMTP_HOST,
        port=SMTP_PORT,
        username=SMTP_USERNAME,
        password=SMTP_PASSWORD,
        start_tls=True
    )