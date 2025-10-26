## How to run

API
`uvicorn src.main:app --reload --host 0.0.0.0`

Redis:
`env OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES rq worker -u "$REDIS_URL" --with-scheduler images`

ENV in root folder:
OPENAI_API_KEY
