# Web Dev Tutor — Gemini-powered

This site has two parts:
- `index.html` — the page people see and use
- `netlify/functions/generate.js` — a private serverless function that calls Gemini using your API key. Your key never appears in the browser.

Because it uses a function, you **can't** just drag-and-drop this folder onto Netlify (drag-and-drop only works for plain static files). You need to deploy it as a project. Two ways to do that, pick whichever is easier for you:

## Option A: Netlify CLI (fastest, no GitHub needed)

1. Install Node.js if you don't have it: https://nodejs.org
2. Open a terminal in this folder and run:
   ```
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod
   ```
3. When it asks for a publish directory, enter `.` (this folder).
4. After it deploys, go to your new site's dashboard on netlify.com → **Site configuration → Environment variables** → add:
   - Key: `GEMINI_API_KEY`
   - Value: your Gemini API key from https://aistudio.google.com/apikey
5. Redeploy once (`netlify deploy --prod` again) so the function picks up the new key.

## Option B: GitHub + Netlify (best for ongoing updates)

1. Create a new GitHub repository and push this folder to it.
2. Go to https://app.netlify.com → **Add new site → Import an existing project** → connect your GitHub repo.
3. Leave build settings as default (publish directory: `.`).
4. In the new site's **Site configuration → Environment variables**, add:
   - Key: `GEMINI_API_KEY`
   - Value: your Gemini API key from https://aistudio.google.com/apikey
5. Trigger a deploy (Netlify usually does this automatically after connecting).

## Getting a Gemini API key

1. Go to https://aistudio.google.com/apikey
2. Sign in with a Google account and click **Create API key**.
3. Copy the key (it may start with `AQ.` — that's the current normal format, it's fine).
4. Paste it into Netlify's environment variables as shown above. Never paste it directly into `index.html` or any file that goes to the browser.

## Testing locally (optional)

If you have the Netlify CLI installed, you can run the whole thing on your own computer before deploying:
```
netlify dev
```
This runs both the page and the function locally at `http://localhost:8888`, using a `.env` file (create one in this folder with `GEMINI_API_KEY=your_key_here`) — just make sure `.env` is never committed to GitHub.
