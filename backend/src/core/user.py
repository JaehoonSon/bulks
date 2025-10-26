from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from supabase import Client

from .config import settings

security = HTTPBearer()

# def get_user(
#     credentials: HTTPAuthorizationCredentials = Depends(security),
#     supabase: Client = Depends(supabase_dependency),
# ):
#     token = credentials.credentials
#     try:
#         payload = jwt.decode(token, settings.supabase_jwt, algorithms=["HS256"])
#     except JWTError:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid or expired token",
#         )

#     user_id = payload.get("sub")
#     if not user_id:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="User not found in token",
#         )

#     # Query Supabase for user
#     response = supabase.auth.admin.get_user_by_id(user_id)
#     user = response.user  # dict with Supabase user fields

#     if not user:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="User not found",
#         )

#     return user


def get_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer authentication required",
            headers={"WWW-Authenticate": 'Bearer realm="auth_required"'},
        )
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.supabase_jwt,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload  # contains user info, e.g., email, sub, etc.
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": 'Bearer realm="auth_required"'},
        )
