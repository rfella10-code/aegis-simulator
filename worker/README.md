# AEGIS API Worker

The Cloudflare Worker that sits between the AEGIS app and the Anthropic API.

- Keeps the API key server-side (secret `ANTHROPIC_API_KEY`)
- Handles CORS for the app
- Allows only Sonnet/Haiku models and caps `max_tokens` at 1500
- Adds the locked safety rules to every **custom-scenario** Actor call (built-in scenarios are unchanged)
- Best-effort rate limit: 60 requests per minute per visitor
- Logs status and timing only, never prompts or replies

The app tries this Worker first (`https://aegis-api.r-fella10.workers.dev`) and falls back to the original `aegis-proxy` if it isn't reachable, so deploying it is safe at any time.

## Deploy from the Cloudflare dashboard (no terminal needed)

1. **Workers & Pages → Create → Import a repository**, connect GitHub if asked, and pick `aegis-simulator`.
2. Settings:
   - **Project name:** `aegis-api` (must match `wrangler.jsonc`)
   - **Root directory / Path:** `worker`
   - **Build command:** leave empty
   - **Deploy command:** `npx wrangler deploy`
   - **Branch:** `main` (or `custom-scenarios` to test before merging)
3. **Create and deploy.**
4. Open the Worker → **Settings → Variables and Secrets → Add**: type **Secret**, name `ANTHROPIC_API_KEY`, value = your Anthropic API key. Save.
5. Visit `https://aegis-api.r-fella10.workers.dev` — it should show `{"ok":true,"service":"aegis-api"}`.

## Later: lock it to your site

In `wrangler.jsonc`, change `ALLOWED_ORIGINS` from `"*"` to your app's address(es), comma-separated.
