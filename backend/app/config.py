import os
from dotenv import load_dotenv


# Get the folder where this config.py file exists
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Explicitly load .env from app/.env
ENV_FILE = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_FILE)


RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")


print("================================")
print("RAZORPAY CONFIG")
print("================================")

print("Key ID loaded:", bool(RAZORPAY_KEY_ID))
print("Key ID:", RAZORPAY_KEY_ID)

print(
    "Key Secret loaded:",
    bool(RAZORPAY_KEY_SECRET)
)

print("================================")