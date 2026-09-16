import qrcode
import secrets
import os


def generate_qr_token():

    return secrets.token_urlsafe(32)


def generate_qr_image(qr_token, reservation_id):

    qr_data = qr_token

    qr = qrcode.QRCode(
        version=1,
        box_size=10,
        border=4
    )

    qr.add_data(qr_data)
    qr.make(fit=True)

    img = qr.make_image(
        fill_color="black",
        back_color="white"
    )

    folder = "static/qr"

    os.makedirs(folder, exist_ok=True)

    filename = f"reservation_{reservation_id}.png"

    filepath = os.path.join(
        folder,
        filename
    )

    img.save(filepath)

    return f"/static/qr/{filename}"