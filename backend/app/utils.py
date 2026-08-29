from pathlib import Path

APP_DIR = Path(__file__).resolve().parent
TEMPLATE_PATH = APP_DIR.joinpath("templates")
TEMPLATE_EMAIL_PATH = TEMPLATE_PATH.joinpath("email")
