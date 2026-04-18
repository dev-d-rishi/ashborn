from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.routes.ai import router as ai_router
from app.routes.system import router as system_router

app = FastAPI()

# CORS (adjust if needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(ai_router)
app.include_router(system_router)


@app.get("/")
def root():
    return {"status": "Ashborn API running"}