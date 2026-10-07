# Mia backend

The public static frontend can optionally connect to the Mia AI World runtime.

Default API base:
https://mia-ai-world.hatchable.site/api

## Endpoints
- GET /health
- POST /mission
- POST /ask
- POST /interest

The frontend falls back to local demo behavior if the runtime is unavailable. It never claims that an external action happened when it did not.

## Production architecture
Frontend: GitHub Pages or another static host.
Runtime: Hatchable, or a future portable backend deployment.
Source of truth: GitHub.
