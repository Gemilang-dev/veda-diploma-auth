import bcrypt
from veda_backend.routes import auth

def fixed_verify(plain_password, hashed_password):
    try:
        # Check if it's a string and encode
        pwd_bytes = plain_password.encode('utf-8')[:72]
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception as e:
        print(f"Bcrypt verify error: {e}")
        return False

def fixed_hash(password: str):
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

# We will apply this via sed or by writing a new file if sed is too complex
