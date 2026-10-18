import pytest
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token

def test_password_hashing():
    pwd = "SecureCyberPassword2026!"
    hashed = get_password_hash(pwd)
    assert hashed != pwd
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False

def test_jwt_token_lifecycle():
    user_id = "test-analyst-uuid-1234"
    token = create_access_token(subject=user_id)
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == user_id

def test_invalid_token():
    assert decode_access_token("malformed.jwt.token") is None
