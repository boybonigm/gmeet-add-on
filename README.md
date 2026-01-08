# GMeet Add-on PoC

A proof-of-concept Google Meet add-on UI built with React, TypeScript, Vite, and Tailwind CSS. It includes a main stage view and a side panel view that communicate through a `BroadcastChannel`.

## Getting started

```bash
npm install
npm run dev
```

Open:
- `http://localhost:5173/mainstage`
- `http://localhost:5173/sidepanel`

## Environment

Edit `.env` with your values before building or deploying.

## GitHub Pages

Push to `main` and enable GitHub Pages for the repository (Build and deployment: GitHub Actions). The workflow injects `VITE_BASE_PATH` based on the repo name.

## Google Workspace Marketplace SDK (HTTPS hosting)

After Pages is enabled, your URLs will look like this:

```
https://<github-username>.github.io/<repo-name>/
```

Use these paths when configuring the Marketplace SDK:

```
Main stage URL:   https://<github-username>.github.io/<repo-name>/mainstage
Side panel URL:   https://<github-username>.github.io/<repo-name>/sidepanel
```

If you rename the repo, the URL changes. Update the SDK settings and redeploy.
