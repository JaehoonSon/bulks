from contextlib import asynccontextmanager
import asyncio, os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from src.api import api_router
from src.auth.service import tiktok_refresh_daemon
from src.publishing.service import publish_scheduler_daemon
from src.core.supabase import init_supabase

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.supabase = init_supabase()
    stop_event = asyncio.Event()
    app.state.spawn_events = [
        asyncio.create_task(tiktok_refresh_daemon(app, stop_event)),
        asyncio.create_task(publish_scheduler_daemon(app, stop_event)),
    ]
    try:
        yield
    finally:
        stop_event.set()
        for t in app.state.spawn_events:
            t.cancel()
        await asyncio.gather(*app.state.spawn_events, return_exceptions=True)


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or list of allowed domains
    allow_credentials=True,
    allow_methods=["*"],  # include "OPTIONS", "POST", etc.
    allow_headers=["*"],
)

app.include_router(api_router)

from fastapi.staticfiles import StaticFiles

os.makedirs("./outputs", exist_ok=True)
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")
app.mount(
    "/scraped-video", StaticFiles(directory="scraped-video"), name="scraped-video"
)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
