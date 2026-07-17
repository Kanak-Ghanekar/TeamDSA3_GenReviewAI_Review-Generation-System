import os
import argparse
import qrcode
from pathlib import Path

def generate_business_qr(business_id: str, host_url: str = "http://localhost:3000") -> str:
    """
    Generates a QR code for a given business ID pointing to the review routing page,
    and saves the generated QR code image in both the backend and frontend asset directories.
    """
    target_url = f"{host_url.rstrip('/')}/r/{business_id}"
    print(f"Generating QR code for Business ID: '{business_id}'")
    print(f"Routing URL: {target_url}")

    # Set up QR code parameters
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(target_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Define paths to save
    backend_dir = Path(__file__).parent / "qrcodes"
    frontend_dir = Path(__file__).parent.parent / "frontend" / "public" / "qrcodes"

    # Ensure directories exist
    backend_dir.mkdir(parents=True, exist_ok=True)
    try:
        frontend_dir.mkdir(parents=True, exist_ok=True)
    except Exception as e:
        print(f"Could not create frontend public/qrcodes directory: {e}")

    # Save to backend folder
    backend_path = backend_dir / f"{business_id}_qr.png"
    img.save(backend_path)
    print(f"Successfully saved backend QR code asset to: {backend_path.resolve()}")

    # Save to frontend public folder if the frontend directory exists
    if (Path(__file__).parent.parent / "frontend").exists():
        frontend_path = frontend_dir / f"{business_id}_qr.png"
        img.save(frontend_path)
        print(f"Successfully saved frontend QR code asset to: {frontend_path.resolve()}")
        return str(frontend_path)
    
    return str(backend_path)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate GenReview AI customer review funnel QR code.")
    parser.add_argument(
        "--business_id",
        type=str,
        required=True,
        help="The unique business ID slug (e.g., test-restaurant)."
    )
    parser.add_argument(
        "--host_url",
        type=str,
        default="http://localhost:3000",
        help="The Next.js frontend deployment URL base (default: http://localhost:3000)."
    )
    args = parser.parse_args()
    generate_business_qr(args.business_id, args.host_url)
