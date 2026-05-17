import os
import json
from dotenv import load_dotenv

# Muat variabel dari file .env
load_dotenv()

# Ambil alamat kontrak dari file .env
DIPLOMA_REGISTRY_ADDRESS = os.getenv("DIPLOMA_REGISTRY_ADDRESS")
ISSUER_REGISTRY_ADDRESS = os.getenv("ISSUER_REGISTRY_ADDRESS")

# Path ke folder ABI
ABI_DIR = os.path.join(os.path.dirname(__file__), "abi")

def load_abi(filename):
    path = os.path.join(ABI_DIR, filename)
    try:
        with open(path, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

ISSUER_REGISTRY_ABI = load_abi("Issuer.json")
DIPLOMA_REGISTRY_ABI = load_abi("Diploma.json")